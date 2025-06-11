"use client"
import { motion } from 'framer-motion';
import { Button, Card, CardBody, CardHeader, Chip, Divider } from '@nextui-org/react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { use } from 'react';


const modules = [
    {
        id: 'authentication-rbac',
        title: 'Authentication & Role-Based Access Control (RBAC)',
        category: 'Security',
        description: 'Secure login system with JWT-based session management for Admin, Faculty, HOD, Principal, and Students. Role-based dashboards and fine-grained access control ensure data security and streamlined operations in college ERP systems.',
        keywords: 'college ERP authentication, RBAC system, secure login for colleges, JWT session management, academic ERP security',
        icon: '🔒',
        detailedContent: {
            intro: 'The Authentication & RBAC module in EduMatrix ensures secure and efficient access control for academic institutions. Built with JWT-based session management, it provides role-specific dashboards for Admin, Faculty, HOD, Principal, and Students, ensuring seamless and secure operations.',
            features: [
                'JWT-based secure login for all users.',
                'Role-based dashboards tailored for each user type.',
                'Fine-grained access control by department and role.',
                'Scalable for institutions of all sizes.',
            ],
            benefits: 'This module enhances security, reduces unauthorized access, and improves user experience with personalized dashboards, making it ideal for modern college ERP systems.',
        },
    },
    {
        id: 'attendance-management',
        title: 'Attendance Management',
        category: 'Productivity',
        description: 'Faculty can mark daily attendance by subject and batch, with auto-generated monthly reports. Real-time dashboards for HOD/Principal and optional SMS/email alerts for absenteeism enhance student engagement in college ERP systems.',
        keywords: 'college attendance system, real-time attendance tracking, automated attendance reports, absenteeism alerts, ERP attendance management',
        icon: '📊',
        detailedContent: {
            intro: 'EduMatrix’s Attendance Management module simplifies tracking student attendance. Faculty can mark attendance by subject and batch, with real-time dashboards for HODs and Principals to monitor trends and ensure compliance.',
            features: [
                'Subject and batch-wise attendance marking.',
                'Auto-generated monthly attendance reports.',
                'Real-time dashboards for HOD/Principal.',
                'Optional SMS/email alerts for absenteeism.',
            ],
            benefits: 'This module saves time, improves transparency, and ensures proactive absenteeism management, boosting institutional efficiency.',
        },
    },
    {
        id: 'obe-mapping',
        title: 'Outcome-Based Education (OBE) Mapping',
        category: 'Academics',
        description: 'Create and manage CO-PO/PSO mappings with an intuitive drag-and-drop interface. Store mappings by academic year and semester for NAAC/NBA compliance in outcome-based education ERP systems.',
        keywords: 'OBE mapping, CO-PO mapping tool, outcome-based education ERP, NAAC compliance, NBA accreditation',
        icon: '📈',
        detailedContent: {
            intro: 'The OBE Mapping module empowers institutions to align Course Outcomes (COs) with Program Outcomes (POs) and Program Specific Outcomes (PSOs) using a user-friendly drag-and-drop or dropdown interface, ensuring compliance with accreditation standards.',
            features: [
                'Drag-and-drop or dropdown CO-PO/PSO mapping.',
                'Academic year and semester-wise storage.',
                'Intuitive interface for faculty.',
                'Compliance with NAAC/NBA standards.',
            ],
            benefits: 'Streamlines curriculum alignment, simplifies accreditation processes, and enhances educational quality.',
        },
    },
    {
        id: 'co-po-assessment',
        title: 'CO & PO Assessment Module',
        category: 'Academics',
        description: 'Enter CO attainment levels, visualize attainment vs. target graphs, and receive curriculum improvement suggestions. Export reports in PDF or Excel for NAAC/NBA accreditation in college ERP systems.',
        keywords: 'CO attainment, PO assessment, curriculum improvement ERP, NAAC report generation, NBA accreditation',
        icon: '🎯',
        detailedContent: {
            intro: 'The CO & PO Assessment module enables faculty to input attainment levels, visualize data through graphs, and receive actionable insights for curriculum improvement, ensuring compliance with accreditation bodies.',
            features: [
                'Input CO attainment from internal exams.',
                'Attainment vs. target visualization graphs.',
                'Curriculum improvement suggestions.',
                'Exportable PDF/Excel reports.',
            ],
            benefits: 'Facilitates data-driven decisions, simplifies accreditation reporting, and improves academic outcomes.',
        },
    },
    {
        id: 'student-feedback',
        title: 'Student Feedback System',
        category: 'Engagement',
        description: 'Collect and analyze semester-wise student feedback on teaching, content, delivery, and infrastructure. Real-time sentiment analysis and detailed reports for faculty and admins in college ERP systems.',
        keywords: 'student feedback system, sentiment analysis for colleges, academic feedback ERP, NAAC compliance, faculty feedback',
        icon: '📝',
        detailedContent: {
            intro: 'The Student Feedback System collects semester-wise feedback, categorizing responses into teaching, content, delivery, and infrastructure, with real-time sentiment analysis for actionable insights.',
            features: [
                'Semester-wise feedback collection.',
                'Categorized questions for comprehensive insights.',
                'Real-time sentiment analysis.',
                'Detailed reports for Admin, HOD, and Faculty.',

            ],
            benefits: 'Improves teaching quality, enhances student satisfaction, and supports accreditation with robust feedback data.',
        },
    },
    {
        id: 'faculty-profile',
        title: 'Faculty Profile & Academic Repository',
        category: 'Productivity',
        description: 'Faculty can showcase academic contributions, certifications, and publications. Exportable profiles for NAAC/NBA audits enhance institutional credibility in college ERP systems.',
        keywords: 'faculty profile management, academic repository, NAAC NBA compliance, faculty achievements ERP',
        icon: '🧠',
        detailedContent: {
            intro: 'The Faculty Profile & Academic Repository module allows faculty to manage their academic and research contributions, including notes, videos, certifications, and publications, with exportable profiles for accreditation.',
            features: [
                'Upload academic and research contributions.',
                'Showcase certifications and publications.',
                'Exportable profiles for NAAC/NBA.',
                'Centralized repository for faculty achievements.',
            ],
            benefits: 'Enhances faculty visibility, streamlines accreditation, and promotes academic excellence.',
        },
    },
    {
        id: 'fees-payment',
        title: 'Fees & Payment Tracking',
        category: 'Finance',
        description: 'Manage fees with installment tracking, integrated payment gateways (e.g., Razorpay), auto-generated receipts, and due payment reminders for seamless financial operations in college ERP systems.',
        keywords: 'college fee management, payment gateway integration, fee tracking ERP, Razorpay integration, financial ERP',
        icon: '💵',
        detailedContent: {
            intro: 'The Fees & Payment Tracking module streamlines financial operations with installment tracking, integrated payment gateways, and automated receipts, ensuring efficient fee management.',
            features: [
                'Installment-based fee tracking.',
                'Payment gateway integration (e.g., Razorpay).',
                'Auto-generated receipts.',
                'Due payment reminders.',
            ],
            benefits: 'Reduces administrative workload, enhances financial transparency, and improves payment compliance.',
        },
    },
    {
        id: 'subject-timetable',
        title: 'Subject & Timetable Management',
        category: 'Productivity',
        description: 'Assign subjects, generate department-wise timetables, detect clashes, and enable dynamic updates. Download timetables as PDFs for easy access in college ERP systems.',
        keywords: 'timetable management, subject assignment, college scheduling ERP, clash detection, timetable PDF export',
        icon: '📚',
        detailedContent: {
            intro: 'The Subject & Timetable Management module simplifies scheduling by assigning subjects to faculty, generating clash-free timetables, and allowing dynamic updates with PDF export capabilities.',
            features: [
                'Subject assignment per semester.',
                'Department-wise timetable generation.',
                'Clash detection and resolution.',
                'PDF timetable export.',
            ],
            benefits: 'Saves time, ensures efficient scheduling, and improves accessibility for faculty and students.',
        },
    },
    {
        id: 'report-generation',
        title: 'Report Generation',
        category: 'Analytics',
        description: 'Generate formatted reports for attendance, CO/PO mapping, assessments, feedback, and faculty profiles. Export to PDF or Excel, ready for NAAC/NBA audits in college ERP systems.',
        keywords: 'NAAC report generation, college ERP reports, academic report export, NBA compliance, report analytics',
        icon: '📄',
        detailedContent: {
            intro: 'The Report Generation module produces formatted reports for various ERP functions, ensuring compliance with NAAC/NBA standards and easy export to PDF or Excel.',
            features: [
                'Reports for attendance, CO/PO, feedback, and more.',
                'PDF and Excel export options.',
                'NAAC/NBA-ready formats.',
                'Customizable report templates.',
            ],
            benefits: 'Simplifies accreditation, enhances data accessibility, and supports institutional decision-making.',
        },
    },
    {
        id: 'mobile-app',
        title: 'Mobile App (React Native)',
        category: 'Accessibility',
        description: 'Lightweight mobile app for students and faculty to view attendance, timetables, exam schedules, and notifications, ensuring accessibility on the go in college ERP systems.',
        keywords: 'college ERP mobile app, React Native education app, student mobile app, faculty mobile app, ERP notifications',
        icon: '🌐',
        detailedContent: {
            intro: 'The React Native Mobile App provides students and faculty with on-the-go access to attendance, timetables, exam schedules, and notifications, enhancing accessibility and engagement.',
            features: [
                'View attendance and timetables.',
                'Access exam schedules.',
                'Receive real-time notifications.',
                'Lightweight and user-friendly interface.',
            ],
            benefits: 'Improves accessibility, enhances user engagement, and supports mobile-first education management.',
        },
    },
];

const ModulePage = ({ params }) => {
    const router = useRouter();
    console.log(params);
        const unwrappedParams = useParams(params);
  const { module } = unwrappedParams; 
    const moduleData = modules.find((m) => m.id === module);

    if (!moduleData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <h1 className="text-3xl text-gray-800">Module Not Found</h1>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{`EduMatrix - ${moduleData.title} | College ERP Module`}</title>
                <meta
                    name="description"
                    content={`Learn about the ${moduleData.title} module of EduMatrix, a modern college ERP system. Discover its features, benefits, and how it enhances academic management.`}
                />
                <meta name="keywords" content={`${moduleData.keywords}, college ERP system, EduMatrix ERP`} />
                <meta name="robots" content="index, follow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta property="og:title" content={`EduMatrix - ${moduleData.title}`} />
                <meta
                    property="og:description"
                    content={`Explore the ${moduleData.title} module of EduMatrix, designed for efficient academic management with features like ${moduleData.keywords.split(', ')[0]}.`}
                />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={`https://yourwebsite.com/blog/${moduleData.id}`} />
                <meta name="twitter:card" content="summary_large_image" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Article',
                            headline: moduleData.title,
                            description: moduleData.detailedContent.intro,
                            publisher: {
                                '@type': 'Organization',
                                name: 'EduMatrix',
                                url: 'https://yourwebsite.com',
                            },
                        }),
                    }}
                />
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 text-gray-800">
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="relative py-20 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                >
                    <div className="absolute inset-0 bg-[url('/hero-bg-pattern.png')] opacity-10" />
                    <motion.h1
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl font-bold"
                    >
                        {moduleData.title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="mt-4 text-lg max-w-3xl mx-auto"
                    >
                        {moduleData.description}
                    </motion.p>
                </motion.section>

                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Card className="shadow-lg">
                        <CardHeader className="flex items-center gap-4">
                            <span className="text-3xl">{moduleData.icon}</span>
                            <div>
                                <h2 className="text-2xl font-semibold text-blue-800">{moduleData.title}</h2>
                                <Chip color="primary" variant="flat" className="mt-2">
                                    {moduleData.category}
                                </Chip>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <p className="text-gray-600 mb-4">{moduleData.detailedContent.intro}</p>
                            <Divider className="my-4" />
                            <h3 className="text-xl font-semibold text-blue-800">Key Features</h3>
                            <ul className="list-disc pl-6 mt-2 text-gray-600">
                                {moduleData.detailedContent.features.map((feature, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.2, duration: 0.5 }}
                                    >
                                        {feature}
                                    </motion.li>
                                ))}
                            </ul>
                            <Divider className="my-4" />
                            <h3 className="text-xl font-semibold text-blue-800">Benefits</h3>
                            <p className="text-gray-600 mt-2">{moduleData.detailedContent.benefits}</p>
                            <Button as={Link} href="/contact" className="mt-6 bg-blue-600 text-white">
                                Get Started with EduMatrix
                            </Button>
                        </CardBody>
                    </Card>
                    <div className="mt-6 text-center">
                        <Link href="/blog" className="text-blue-600 hover:text-blue-800">
                            Back to Blog
                        </Link>
                    </div>
                </section>
            </div>
        </>
    );
};

export default ModulePage;