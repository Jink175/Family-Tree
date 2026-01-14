"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ImageIcon, Layout, Download, Sparkles, Zap, Users, ArrowRight } from "lucide-react"

interface LandingPageProps {
  onGetStarted?: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: ImageIcon,
      title: "Background Customization",
      description: "Choose from 20+ beautiful background images to personalize your diagram",
    },
    {
      icon: Layout,
      title: "Pre-built Templates",
      description: "Start with templates like Family Tree, Mind Map, Organization Chart, Timeline",
    },
    {
      icon: Download,
      title: "Export to PNG",
      description: "Save your diagrams as high-quality PNG images for sharing and printing",
    },
    {
      icon: Sparkles,
      title: "AI Family Recognition",
      description: "Automatically detect and organize family members from photos",
    },
    {
      icon: Zap,
      title: "Drag & Drop Drawing",
      description: "Intuitive interface for creating, connecting, and organizing diagrams",
    },
    {
      icon: Users,
      title: "Flexible Relationships",
      description: "Connect family members with customizable relationship types and annotations",
    },
  ]

  const timeline = [
    {
      year: "2022",
      title: "FamilyTree Launched",
      description: "Initial release with core features for creating family tree diagrams",
    },
    {
      year: "2023",
      title: "Background & Templates",
      description: "Added background customization and multiple diagram templates",
    },
    {
      year: "2024",
      title: "AI Recognition",
      description: "Integrated AI to recognize family members from photos automatically",
    },
    {
      year: "2025",
      title: "Multi-template Support",
      description: "Expanded to support mind maps, org charts, timelines and more",
    },
  ]

  return (
    <div className="min-h-screen bg-background mt-30 rounded-2xl">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 sm:py-32 ">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl sm:text-6xl font-bold text-[#2d6a4f] text-balance">
              Create Beautiful Family Trees & Diagrams
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Drag-and-drop diagram builder with customizable backgrounds, AI recognition, and beautiful templates.
              Perfect for genealogy, education, and visualization.
            </p>
          </div>
          <Link href="/create">
            <Button
                size="lg"
                onClick={onGetStarted}
                className="bg-[#2d6a4f] hover:bg-primary/90 text-primary-foreground gap-2 cursor-pointer"
            >
                
                Start Creating <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-bold text-[#2d6a4f]">Powerful Features</h3>
            <p className="text-lg text-muted-foreground">Everything you need to create stunning diagrams</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.title}
                  className="p-6 border border-border bg-card hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-[#2d6a4f]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-bold text-[#2d6a4f]">Perfect For</h3>
            <p className="text-lg text-muted-foreground">Discover how people use FamilyTree</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Genealogy Research",
                description:
                  "Track family lineages, ancestry connections, and historical family data across generations",
                icon: "👨‍👩‍👧‍👦",
              },
              {
                title: "Education",
                description:
                  "Help students understand family structures, relationships, and organizational hierarchies",
                icon: "📚",
              },
              {
                title: "Organization Planning",
                description: "Create organizational charts, team structures, and reporting hierarchies",
                icon: "🏢",
              },
              {
                title: "Project Management",
                description: "Visualize project workflows, dependencies, and team responsibilities",
                icon: "📊",
              },
              {
                title: "Mind Mapping",
                description: "Brainstorm ideas and create visual mind maps for planning and creativity",
                icon: "💡",
              },
              {
                title: "Timeline Planning",
                description: "Create visual timelines for events, milestones, and historical documentation",
                icon: "📅",
              },
            ].map((useCase) => (
              <Card key={useCase.title} className="p-6 border border-border hover:shadow-lg transition-shadow">
                <div className="space-y-3">
                  <div className="text-4xl">{useCase.icon}</div>
                  <h4 className="font-semibold text-foreground text-lg">{useCase.title}</h4>
                  <p className="text-sm text-muted-foreground">{useCase.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 bg-secondary/20 rounded-2xl">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-bold text-[#2d6a4f]">Our Journey</h3>
            <p className="text-lg text-muted-foreground">How FamilyTree evolved</p>
          </div>
          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div key={item.year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-primary mt-1.5" />
                  {index !== timeline.length - 1 && <div className="w-1 h-20 bg-border mt-2" />}
                </div>
                <div className="pb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-primary">{item.year}</span>
                    <h4 className="text-lg font-semibold text-[#2d6a4f]">{item.title}</h4>
                  </div>
                  <p className="text-muted-foreground mt-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 bg-secondary/10 rounded-2xl">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-bold text-[#2d6a4f]">What Users Say</h3>
            <p className="text-lg text-muted-foreground">Trusted by families and organizations worldwide</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Johnson",
                role: "Genealogy Researcher",
                content:
                  "Finally, an easy way to organize my family history! The drag-and-drop interface makes it so intuitive.",
                rating: 5,
              },
              {
                name: "Michael Chen",
                role: "Teacher",
                content:
                  "My students love creating diagrams with this tool. It makes learning about structures so visual and engaging!",
                rating: 5,
              },
              {
                name: "Emma Rodriguez",
                role: "HR Manager",
                content:
                  "Created our entire organizational chart in minutes. Saved us hours of work and looks professional.",
                rating: 5,
              },
            ].map((testimonial) => (
              <Card key={testimonial.name} className="p-6 border border-border">
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-lg">
                        ⭐
                      </span>
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">{testimonial.content}</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-bold text-[#2d6a4f]">Feature Highlights</h3>
            <p className="text-lg text-muted-foreground">Advanced capabilities for every need</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Smart Canvas",
                points: [
                  "Infinite canvas with zoom & pan controls",
                  "20+ beautiful background images",
                  "Automatic grid alignment and snapping",
                  "Real-time collaboration ready",
                ],
              },
              {
                title: "Flexible Drawing",
                points: [
                  "Free-form arrow connections",
                  "Customizable line styles (solid, dashed, dotted)",
                  "Multiple relationship types",
                  "Color-coded annotations",
                ],
              },
              {
                title: "Rich Content",
                points: [
                  "Upload photos for avatars",
                  "Add detailed notes and descriptions",
                  "Support for dates and milestones",
                  "Custom labels and metadata",
                ],
              },
              {
                title: "Export & Share",
                points: [
                  "Export to PNG for printing and sharing",
                  "Save as JSON for backups",
                  "Multiple diagram templates",
                  "Local storage with sync capabilities",
                ],
              },
            ].map((feature) => (
              <Card key={feature.title} className="p-8 border border-border">
                <h4 className="text-xl font-semibold text-foreground mb-4">{feature.title}</h4>
                <ul className="space-y-3">
                  {feature.points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-0.5">✓</span>
                      <span className="text-muted-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-bold text-[#2d6a4f]">Frequently Asked Questions</h3>
            <p className="text-lg text-muted-foreground">Find answers to common questions</p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Is my data safe and private?",
                a: "Yes! All your diagrams and personal information are stored securely in your browser's local storage or our encrypted servers. We never share your data with third parties.",
              },
              {
                q: "Can I export my diagrams?",
                a: "You can export diagrams as PNG images for sharing, printing, or using in documents. We also support JSON export for backups.",
              },
              {
                q: "Do I need to create an account?",
                a: "No account is required to start creating diagrams! However, creating a profile helps you save and organize multiple diagrams.",
              },
              {
                q: "What browsers are supported?",
                a: "FamilyTree works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend the latest version for the best experience.",
              },
              {
                q: "Can I use templates as a starting point?",
                a: "Yes! We provide multiple templates including Family Tree, Mind Map, Organization Chart, and Timeline. Start with a template and customize it to your needs.",
              },
              {
                q: "How do I use AI recognition?",
                a: "Upload photos to any person in your diagram. Our AI will automatically detect and suggest family members, helping you organize your tree faster.",
              },
            ].map((faq, index) => (
              <Card key={index} className="p-6 border border-border">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground text-lg">{faq.q}</h4>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 bg-primary/5 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Active Users", value: "10K+" },
            { label: "Diagrams Created", value: "50K+" },
            { label: "Countries", value: "80+" },
            { label: "Template Types", value: "10+" },
          ].map((stat) => (
            <div key={stat.label} className="space-y-2">
              <p className="text-4xl font-bold text-[#2d6a4f]">{stat.value}</p>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl bg-linear-to-r from-primary to-accent p-12 text-center space-y-6">
          <h3 className="text-4xl font-bold text-[#2d6a4f]">Ready to Create Your First Diagram?</h3>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands creating beautiful family trees, mind maps, and diagrams
          </p>
          <Link href="/create">
            <Button
              size="lg"
              className="bg-[#2d6a4f] cursor-pointer hover:bg-primary-foreground/90 text-primary"
            >
              Get Started Now <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
