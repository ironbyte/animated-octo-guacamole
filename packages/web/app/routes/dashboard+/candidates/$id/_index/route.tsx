import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { db } from '@nautikos/core/db'
import { jobSeeker } from '@nautikos/core/schema/job-seeker'
import {
	moderatorEvaluations,
	type InsertModeratorEvaluationModel,
} from '@nautikos/core/schema/moderator-evaluations'
import {
	moderatorReviews,
	type InsertModeratorReviewModel,
} from '@nautikos/core/schema/moderator-reviews'
import { parseWithZod } from '@conform-to/zod'
import { format, formatDate } from 'date-fns'
import { eq } from 'drizzle-orm'
import {
	Anchor,
	AwardIcon,
	Briefcase,
	Building,
	Calendar,
	Clock,
	ExternalLinkIcon,
	FileIcon,
	FileText,
	FileTextIcon,
	GraduationCap,
	Link2,
	LinkedinIcon,
	MapPin,
	User,
	Users,
	VideoIcon,
} from 'lucide-react'
import invariant from 'tiny-invariant'

import { BadgesList } from '~/components/badges-list'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'
import { requireUserSession } from '~/lib/auth.server'
import { createToastHeaders } from '~/lib/toast.server'
import { EvaluateCandidateProfileFormDialog } from './evaluate-candidate-profile-form-dialog'
import { SetReviewCommentForm } from './set-review-comment-form'
import {
	setReviewCommentSchema,
	submitCandidateEvaluationSchema,
} from './validation.schema'

export enum CandidateActionIntent {
	SetReviewComment = 'set-review-comment',
	submitCandidateEvaluation = 'submit-candidate-evaluation',
}

async function submitCandidateEvaluationAction({
	formData,
	userId,
}: {
	userId: string
	formData: FormData
}) {
	const submission = await parseWithZod(formData, {
		schema: submitCandidateEvaluationSchema,
	})

	if (submission.status !== 'success') {
		console.log('submission.reply():', submission.reply())

		return json({ result: submission.reply() })
	}

	const { value } = submission

	const submitCandidateEvaluationInsert: InsertModeratorEvaluationModel = {
		...value,
		moderatorId: userId,
	}

	console.debug(
		'submitCandidateEvaluationInsert: ',
		JSON.stringify(submitCandidateEvaluationInsert, null, 2),
	)

	await db
		.insert(moderatorEvaluations)
		.values(submitCandidateEvaluationInsert)
		.onConflictDoUpdate({
			target: [moderatorEvaluations.jobSeekerId, moderatorReviews.moderatorId],
			set: {
				...value,
				timeUpdated: new Date(),
			},
		})

	return json(
		{
			result: submission.reply(),
		},
		{
			headers: await createToastHeaders({
				type: 'success',
				title: 'Success!',
				description: 'Saved successfully',
			}),
		},
	)
}

async function setReviewCommentAction({
	formData,
	userId,
}: {
	userId: string
	formData: FormData
}) {
	const submission = await parseWithZod(formData, {
		schema: setReviewCommentSchema,
	})

	if (submission.status !== 'success') {
		console.log('submission.reply():', submission.reply())

		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { value } = submission

	const reviewCommentInsert: InsertModeratorReviewModel = {
		...value,
		moderatorId: userId,
		reviewedAt: new Date(),
	}

	await db
		.insert(moderatorReviews)
		.values(reviewCommentInsert)
		.onConflictDoUpdate({
			target: [moderatorReviews.jobSeekerId, moderatorReviews.section],
			set: {
				comment: reviewCommentInsert.comment,
				timeUpdated: new Date(),
			},
		})

	return json(
		{
			result: submission.reply(),
		},
		{
			headers: await createToastHeaders({
				type: 'success',
				title: 'Success!',
				description: 'Saved successfully',
			}),
		},
	)
}

export async function action({ request }: ActionFunctionArgs) {
	const userSession = await requireUserSession(request)
	const userId = userSession.user.id

	const formData = await request.formData()
	const intent = formData.get('intent')

	switch (intent) {
		case CandidateActionIntent.SetReviewComment: {
			return setReviewCommentAction({
				userId,
				formData,
			})
		}

		case CandidateActionIntent.submitCandidateEvaluation: {
			return submitCandidateEvaluationAction({
				userId,
				formData,
			})
		}

		default: {
			throw new Response(`Invalid intent "${intent}"`, { status: 400 })
		}
	}
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const userSession = await requireUserSession(request)
	const { user: currentUser } = userSession

	invariant(params.id, 'Candidate Number is required')

	const parseIntId = parseInt(params.id)

	if (isNaN(parseIntId)) {
		throw new Response('Invalid Candidate Number', { status: 400 })
	}

	const jobSeekerData = await db.query.jobSeeker.findFirst({
		where: eq(jobSeeker.candidateNumber, parseIntId),
		with: {
			user: {
				with: {
					profile: true,
				},
			},
			education: true,
			memberships: true,
			professionalCertifications: true,
			seagoingExperience: true,
			targetCompanies: {
				with: {
					company: {
						columns: {
							name: true,
						},
					},
				},
			},
			workExperiences: {
				with: {
					country: true,
				},
			},
			jobSeekerQuestions: true,
			publications: true,
		},
	})

	if (!jobSeekerData) {
		throw new Response('Candidate not found', { status: 404 })
	}

	const moderatorReviewsList = await db.query.moderatorReviews.findMany({
		where: eq(moderatorReviews.jobSeekerId, jobSeekerData.id),
		with: {
			moderator: true,
		},
	})

	const moderatorEvaluationsList = await db.query.moderatorEvaluations.findMany(
		{
			where: eq(moderatorEvaluations.jobSeekerId, jobSeekerData.id),
			with: {
				jobSeeker: true,
				moderator: true,
			},
		},
	)

	return json({
		candidate: jobSeekerData,
		moderatorReviewsList,
		moderatorEvaluationsList,
		currentUser,
	})
}

export function CandidateDetailsPage() {
	const { candidate } = useLoaderData<typeof loader>()
	const { id: jobSeekerId } = candidate

	if (!candidate) {
		return (
			<div className="flex h-screen items-center justify-center">
				Candidate not found
			</div>
		)
	}

	const localMarketExperiences: string[] = []

	if (candidate.arabicSpeaking) {
		localMarketExperiences.push('Arabic Speaking')
	}

	if (candidate.dubaiTradePortal) {
		localMarketExperiences.push('Dubai Trade Portal')
	}

	if (candidate.freeZoneProcess) {
		localMarketExperiences.push('UAE Free Zone Process')
	}

	if (candidate.uaeCustoms) {
		localMarketExperiences.push('UAE Custom Process')
	}

	return (
		<div className="px-4 py-8">
			<h1 className="mb-6 text-3xl font-bold">Review Candidate Details</h1>

			<div className="mb-6 flex justify-end">
				<EvaluateCandidateProfileFormDialog jobSeekerId={candidate.id} />
			</div>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-2xl">Personal Information</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="flex items-center">
							<User className="mr-2 h-4 w-4" />
							<span className="mr-2 font-semibold">Name:</span>
							{candidate.user.profile.firstName}{' '}
							{candidate.user.profile.lastName}
						</div>

						<div className="flex items-center">
							<MapPin className="mr-2 h-4 w-4" />
							<span className="mr-2 font-semibold">Email:</span>
							{candidate.user.email}
						</div>

						<div className="flex items-center">
							<Calendar className="mr-2 h-4 w-4" />
							<span className="mr-2 font-semibold">Available From:</span>
							{candidate.availableFrom &&
								format(candidate.availableFrom, 'dd/MM/yyyy')}
						</div>

						{candidate.personalWebsiteUrl && (
							<div className="flex items-center">
								<LinkedinIcon className="mr-2 h-4 w-4" />
								<Link
									to={candidate.personalWebsiteUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									<span className="flex items-center gap-2">
										Linkedin Profile
										<ExternalLinkIcon className="h-4 w-4" />
									</span>
								</Link>
							</div>
						)}
					</div>
					<BadgesList items={localMarketExperiences} direction="horizontal" />
				</CardContent>
				<CardFooter>
					<SetReviewCommentForm
						section="personal_info"
						jobSeekerId={jobSeekerId}
					/>
				</CardFooter>
			</Card>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-2xl">CV/Resume</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center space-x-4">
						<FileIcon className="h-6 w-6" />
						{candidate.cvUploadedAt && (
							<div>
								<p className="font-semibold">{candidate.cvFileName}</p>
								<p className="text-muted-foreground text-sm">
									Uploaded on {format(candidate.cvUploadedAt, 'dd/mm/yyyy')} •{' '}
									{`PDF`}
								</p>
							</div>
						)}
					</div>
					<Button variant="outline" className="mt-4">
						<FileText className="mr-2 h-4 w-4" />
						View CV/Resume
					</Button>
				</CardContent>

				<CardFooter>
					<SetReviewCommentForm
						section="cv_and_resume"
						jobSeekerId={jobSeekerId}
					/>
				</CardFooter>
			</Card>

			{candidate.videoCVUrl && (
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="text-2xl">Intro Video</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center space-x-4">
							<VideoIcon className="h-6 w-6 text-red-500" />
							<a
								href={candidate.videoCVUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
							>
								Watch Intro Video
							</a>
						</div>
					</CardContent>

					<CardFooter>
						<SetReviewCommentForm
							section="intro_video"
							jobSeekerId={jobSeekerId}
						/>
					</CardFooter>
				</Card>
			)}

			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-2xl">Education</CardTitle>
				</CardHeader>
				<CardContent>
					{candidate.education.map((edu, index) => (
						<div key={index} className="mb-4 last:mb-0">
							<h3 className="text-lg font-semibold">
								{edu.degreeName} in {edu.fieldOfStudy}
							</h3>
							<p className="text-muted-foreground">{edu.institution}</p>
							<div className="mt-1 flex items-center">
								<GraduationCap className="mr-2 h-4 w-4" />
								<span>{edu.educationLevel}</span>
								<span className="mx-2">•</span>
								<Calendar className="mr-2 h-4 w-4" />

								<span>
									{edu.educationStartYear} - {edu.educationEndYear}
								</span>
							</div>
							{index < candidate.education.length - 1 && (
								<Separator className="my-4" />
							)}
						</div>
					))}
				</CardContent>
				<CardFooter>
					<SetReviewCommentForm section="education" jobSeekerId={jobSeekerId} />
				</CardFooter>
			</Card>

			{candidate.memberships.length > 0 && (
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="text-2xl">Memberships</CardTitle>
					</CardHeader>
					<CardContent>
						{candidate.memberships.map((membership, index) => (
							<div key={index} className="mb-4 last:mb-0">
								<h3 className="text-lg font-semibold">
									{membership.membershipBodyName}
								</h3>
								<div className="mt-1 flex items-center">
									<AwardIcon className="mr-2 h-4 w-4" />
									<span>
										Joined in{' '}
										{format(membership.membershipJoiningYear, 'dd/MM/yyyy')}
									</span>
								</div>
								<div className="mt-2">
									<Button variant="outline" size="sm" asChild>
										<a
											href={'https://google.com'}
											target="_blank"
											rel="noopener noreferrer"
										>
											<FileTextIcon className="mr-2 h-4 w-4" />
											View Certificate
										</a>
									</Button>
								</div>
								{index < candidate.memberships.length - 1 && (
									<Separator className="my-4" />
								)}
							</div>
						))}
					</CardContent>
					<CardFooter>
						<SetReviewCommentForm
							section="memberships"
							jobSeekerId={jobSeekerId}
						/>
					</CardFooter>
				</Card>
			)}

			{candidate.professionalCertifications.length > 0 && (
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="text-2xl">
							Professional Certifications
						</CardTitle>
					</CardHeader>
					<CardContent>
						{candidate.professionalCertifications.map((profCert, index) => (
							<div key={index} className="mb-4 last:mb-0">
								<h3 className="text-lg font-semibold">
									{profCert.proCertificationName}
								</h3>
								<div className="mt-2">
									<Button variant="outline" size="sm" asChild>
										<a
											href={'https://google.com'}
											target="_blank"
											rel="noopener noreferrer"
										>
											<FileTextIcon className="mr-2 h-4 w-4" />
											View Professional Certificate
										</a>
									</Button>
								</div>
								{index < candidate.professionalCertifications.length - 1 && (
									<Separator className="my-4" />
								)}
							</div>
						))}
					</CardContent>
					<CardFooter>
						<SetReviewCommentForm
							section="professional_certifications"
							jobSeekerId={jobSeekerId}
						/>
					</CardFooter>
				</Card>
			)}

			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-2xl">Corporate Experience</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="flex items-center">
							<Briefcase className="mr-2 h-4 w-4" />
							<span className="mr-2 font-semibold">Total Years:</span>
							{candidate.totalYearsExperience}
						</div>
						<div className="flex items-center">
							<Users className="mr-2 h-4 w-4" />
							<span className="mr-2 font-semibold">
								People Management Experience:
							</span>
							{candidate.peopleManagementExperience}
						</div>
					</div>
				</CardContent>
				<CardFooter>
					<SetReviewCommentForm
						section="corporate_experience"
						jobSeekerId={jobSeekerId}
					/>
				</CardFooter>
			</Card>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-2xl">Sea-going Experience</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="flex items-center">
							<Anchor className="mr-2 h-4 w-4" />
							<span className="mr-2 font-semibold">Highest Achieved Rank:</span>
							{candidate.seagoingExperience.seaRank}
						</div>
						<div className="flex items-center">
							<Clock className="mr-2 h-4 w-4" />
							<span className="mr-2 font-semibold">Years of Experience:</span>
							{candidate.seagoingExperience.totalYearsSeaGoingExperience}
						</div>
					</div>
				</CardContent>
				<CardFooter>
					<SetReviewCommentForm
						section="seagoing_experience"
						jobSeekerId={jobSeekerId}
					/>
				</CardFooter>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Work Experience</CardTitle>
				</CardHeader>
				<CardContent>
					{candidate.workExperiences.map((exp, index) => (
						<div key={index} className="mb-4 last:mb-0">
							<h3 className="text-lg font-semibold">{exp.role}</h3>
							<p className="text-muted-foreground">{exp.company}</p>
							<div className="mt-1 flex items-center">
								<Building className="mr-2 h-4 w-4" />
								<span>{exp.country.name}</span>
								<span className="mx-2">•</span>
								<Clock className="mr-2 h-4 w-4" />
								<span>{exp.jobType}</span>
							</div>
							<div className="mt-1 flex items-center">
								<Calendar className="mr-2 h-4 w-4" />
								<span>
									{exp.workStartYear} -{' '}
									{!exp.workEndYear ? 'Present' : exp.workEndYear}
								</span>
								{!exp.workEndYear && <Badge className="ml-2">Ongoing</Badge>}
							</div>
							{index < candidate.workExperiences.length - 1 && (
								<Separator className="my-4" />
							)}
						</div>
					))}
				</CardContent>
				<CardFooter>
					<SetReviewCommentForm
						section="work_experience"
						jobSeekerId={jobSeekerId}
					/>
				</CardFooter>
			</Card>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-2xl">Culture</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4">
						<div>
							<span className="mr-2 font-semibold">Target Companies:</span>
							{candidate.targetCompanies.map((c) => c.company.name).join(', ')}
						</div>
						<div>
							<span className="mr-2 font-semibold">Preferred Emirates:</span>
							<div className="mt-1 flex flex-wrap gap-2">
								{candidate.emiratesPreference &&
									candidate.emiratesPreference.map((emirate, index) => (
										<Badge key={index}>{emirate}</Badge>
									))}
							</div>
						</div>
						{candidate.availableFrom && (
							<div className="flex items-center">
								<Calendar className="mr-2 h-4 w-4" />
								<span className="mr-2 font-semibold">Available From:</span>
								{formatDate(candidate.availableFrom, 'dd/MM/yyyy')}
							</div>
						)}
					</div>
				</CardContent>
				<CardFooter>
					<SetReviewCommentForm section="culture" jobSeekerId={jobSeekerId} />
				</CardFooter>
			</Card>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-2xl">Questions & Answers</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div>
							<p className="font-semibold">
								What are you seeking in your next job?
							</p>
							<p>{candidate.jobSeekerQuestions.nextJobSeek}</p>
						</div>
						<div>
							<p className="font-semibold">What motivates you the most?</p>
							<p>{candidate.jobSeekerQuestions.motivation}</p>
						</div>
						<div>
							<p className="font-semibold">
								What type of work environment do you thrive in?
							</p>
							<p>{candidate.jobSeekerQuestions.workEnvironment}</p>
						</div>
						{candidate.jobSeekerQuestions.topValuesInNextJob && (
							<div>
								<p className="font-semibold">Interests:</p>
								<div className="mt-1 flex flex-col flex-wrap gap-2">
									{candidate.jobSeekerQuestions.topValuesInNextJob.map(
										(value, index) => (
											<Badge key={index} className="w-fit">
												{value}
											</Badge>
										),
									)}
								</div>
							</div>
						)}
					</div>
				</CardContent>
				<CardFooter>
					<SetReviewCommentForm
						section="questions_and_answers"
						jobSeekerId={jobSeekerId}
					/>
				</CardFooter>
			</Card>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-2xl">
						Publications (Reminder: sanitize unsafe links on the backend)
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ul className="list-disc space-y-2 pl-5">
						{candidate.publications.map((pub, index) => (
							<li key={index}>
								{pub.publicationLink && (
									<a
										href={pub.publicationLink}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:underline"
									>
										<Link2 className="mr-2 inline-block h-4 w-4" />
										{pub.publicationLink}
									</a>
								)}
							</li>
						))}
					</ul>
				</CardContent>

				<CardFooter>
					<SetReviewCommentForm
						section="publications"
						jobSeekerId={jobSeekerId}
					/>
				</CardFooter>
			</Card>
		</div>
	)
}
export default function Route() {
	return <CandidateDetailsPage />
}
