<script setup lang="ts">
import {
  ArrowDown,
  ArrowRight,
  Check,
  Clock,
  Compass,
  FileSearch,
  HelpCircle,
  Info,
  MapPin,
  MessageSquarePlus,
  Repeat,
  Send,
  ShieldCheck,
} from "lucide-vue-next";
import heroImage from "~/assets/images/govconnect-sa-hero.jpg";

const runtimeConfig = useRuntimeConfig();
const siteUrl = (runtimeConfig.public.siteUrl || "http://localhost:3000").replace(/\/+$/, "");
const ogImageUrl = `${siteUrl}/og-image.jpg`;
const pageTitle = "GovConnect SA | Share Your Public-Service Experience";
const pageDescription =
  "An independent South African research project exploring easier online access to public services. Share your experience and help identify what matters most.";

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  keywords:
    "GovConnect SA, South Africa public services, government services online, Home Affairs feedback, SASSA feedback, municipal services survey",
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogType: "website",
  ogUrl: `${siteUrl}/`,
  ogSiteName: "GovConnect SA",
  ogLocale: "en_ZA",
  ogImage: ogImageUrl,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: "South African citizens reviewing digital public-service access on a smartphone",
  twitterCard: "summary_large_image",
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: ogImageUrl,
});

useHead({
  link: [{ rel: "canonical", href: `${siteUrl}/` }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "GovConnect SA",
        url: `${siteUrl}/`,
        description: pageDescription,
        inLanguage: "en-ZA",
        publisher: {
          "@type": "Organization",
          name: "GovConnect SA",
          url: `${siteUrl}/`,
          logo: {
            "@type": "ImageObject",
            url: `${siteUrl}/favicon.png`,
          },
        },
      }),
    },
  ],
});

const challenges = [
  { text: "Long queues at government offices", icon: Clock },
  { text: "Travelling far to reach a service point", icon: MapPin },
  { text: "Uncertainty about application progress", icon: HelpCircle },
  { text: "Repeated visits to submit documents or ask questions", icon: Repeat },
  { text: "Difficulty finding clear information about services", icon: FileSearch },
];

const possibleCapabilities = [
  "Discover available government services",
  "Understand application requirements",
  "Submit service requests online",
  "Upload supporting documents",
  "Track the progress of requests",
  "Receive important updates and information",
];

const possibleSteps = [
  {
    step: "Step 1",
    title: "Discover",
    text: "Find the public service you need and see what documents are required upfront.",
    icon: Compass,
  },
  {
    step: "Step 2",
    title: "Submit",
    text: "Send your request and supporting details online without queuing first.",
    icon: Send,
  },
  {
    step: "Step 3",
    title: "Track",
    text: "Follow progress and receive clear status updates along the way.",
    icon: Check,
  },
];
const pageRoot = ref<HTMLElement | null>(null);
useScrollReveal(pageRoot);
</script>

<template>
  <div ref="pageRoot">
    <section id="home" class="scroll-mt-24">
      <div class="mx-auto max-w-7xl px-5 pb-0 pt-10 sm:px-8 sm:pt-14 lg:pt-16">
        <!-- <p class="text-sm font-medium text-civic-green-deep">
          South African public-service research
        </p> -->
        <h1
          class="content-reveal mt-3 max-w-4xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-primary sm:text-5xl lg:text-6xl"
        >
          Government Services,
          <span class="block font-semibold text-civic-green-deep">Made More Accessible.</span>
        </h1>
        <div
          class="content-reveal-delay-1 mt-7 grid gap-6 border-t border-border pt-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center"
        >
          <p class="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Accessing public services shouldn't mean taking a full day off work to travel and wait
            in queues. GovConnect SA is collecting feedback to learn which services South Africans
            struggle with most and which ones belong online first.
          </p>
          <div class="flex flex-wrap gap-3 lg:justify-end">
            <Button as="a" href="#feedback" variant="civic" size="lg" class="min-h-12 px-6">
              <MessageSquarePlus aria-hidden="true" />
              <span>Share Your Feedback</span>
            </Button>
            <Button as="a" href="#about" variant="outline" size="lg" class="min-h-12 px-6">
              <span>Learn More</span>
              <!-- <ArrowDown aria-hidden="true" /> -->
            </Button>
          </div>
        </div>
      </div>
      <div
        class="content-reveal-delay-2 mx-auto mt-8 max-w-7xl px-5 pb-12 sm:px-8 lg:mt-10 lg:pb-16"
      >
        <img
          :src="heroImage"
          alt="A younger woman and an older woman sharing a smartphone in a bright community space."
          width="1400"
          height="933"
          loading="eager"
          decoding="async"
          fetchpriority="high"
          class="aspect-[4/3] w-full rounded-md border-b-4 border-civic-green object-cover object-top sm:aspect-[2/1]"
        />
      </div>
    </section>

    <section id="feedback" class="scroll-mt-24 border-y border-border bg-civic-soft/60">
      <div
        data-reveal
        class="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14 lg:py-24"
      >
        <div class="lg:sticky lg:top-32 lg:self-start">
          <h2
            class="max-w-md font-display text-3xl font-semibold leading-tight tracking-tight text-primary sm:text-4xl"
          >
            Tell us what slows you down.
          </h2>
          <p class="mt-4 max-w-md text-base leading-7 text-muted-foreground">
            Share which department you dealt with, the bottlenecks you ran into, and which services
            you would rather complete online.
          </p>
          <div class="mt-8 border-l-2 border-civic-gold pl-5">
            <p class="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Info class="size-4 shrink-0 text-civic-gold" aria-hidden="true" />
              <span>Research survey only</span>
            </p>
            <p class="mt-2 text-sm leading-6 text-muted-foreground">
              No applications or official government requests are processed on this site.
            </p>
          </div>
        </div>
        <FeedbackForm />
      </div>
    </section>

    <section id="about" class="scroll-mt-24">
      <div data-reveal class="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
        <div class="grid gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <h2
              class="max-w-lg font-display text-3xl font-semibold leading-tight tracking-tight text-primary sm:text-4xl"
            >
              Why public services feel harder than they should
            </h2>
          </div>
          <p class="max-w-2xl text-base leading-7 text-muted-foreground">
            These are the common bottlenecks we are testing through this survey, rather than
            assuming every person runs into the same issues.
          </p>
        </div>

        <ul class="mt-10 grid gap-x-10 sm:grid-cols-2">
          <li
            v-for="item in challenges"
            :key="item.text"
            class="-mx-2 flex items-start gap-3.5 rounded-md border-t border-border px-2 py-5 transition-colors duration-200 hover:bg-civic-soft/60"
          >
            <component
              :is="item.icon"
              class="mt-1 size-5 shrink-0 text-civic-green-deep"
              aria-hidden="true"
            />
            <p class="text-base leading-6 text-foreground">{{ item.text }}</p>
          </li>
        </ul>
      </div>
    </section>

    <section class="border-y border-border bg-muted/70">
      <div
        data-reveal
        class="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-24"
      >
        <div>
          <h2
            class="max-w-lg font-display text-3xl font-semibold leading-tight tracking-tight text-primary sm:text-4xl"
          >
            What a connected portal could cover
          </h2>
          <p class="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            We are exploring whether a single portal could bring together service requirements,
            submissions, and status updates. Any future rollout would depend on research, technical
            feasibility, and formal cooperation with the relevant departments.
          </p>
        </div>
        <ul class="grid gap-x-8 sm:grid-cols-2">
          <li
            v-for="capability in possibleCapabilities"
            :key="capability"
            class="flex items-start gap-3 border-b border-border py-4"
          >
            <Check class="mt-1 size-4 shrink-0 text-civic-green-deep" aria-hidden="true" />
            <span class="text-sm font-medium leading-6 text-foreground">
              {{ capability }}
            </span>
          </li>
        </ul>
      </div>
    </section>

    <section id="how-it-works" class="scroll-mt-24">
      <div data-reveal class="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
        <div class="max-w-2xl">
          <h2
            class="font-display text-3xl font-semibold leading-tight tracking-tight text-primary sm:text-4xl"
          >
            How it could work
          </h2>
          <p class="mt-4 text-base leading-7 text-muted-foreground">
            A straightforward flow we want to validate with the public before building anything.
          </p>
        </div>
        <div class="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
          <article
            v-for="item in possibleSteps"
            :key="item.step"
            class="border-t-2 border-civic-green pt-6 transition-transform duration-300 hover:-translate-y-0.5"
          >
            <div class="flex items-center justify-between gap-4">
              <span class="text-sm font-semibold text-civic-green-deep">
                {{ item.step }}
              </span>
              <component :is="item.icon" class="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <h3 class="mt-4 text-xl font-semibold text-primary">{{ item.title }}</h3>
            <p class="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{{ item.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="contact" class="scroll-mt-24 bg-primary text-primary-foreground">
      <div
        data-reveal
        class="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-14 sm:px-8 sm:py-16 md:flex-row md:items-center md:justify-between"
      >
        <div class="max-w-2xl">
          <h2 class="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Have a recent experience to add?
          </h2>
          <p class="mt-3 max-w-xl text-base leading-7 text-primary-foreground/80">
            Whether it was Home Affairs, SASSA, municipal services, or another office, your input
            takes about two minutes.
          </p>
        </div>
        <Button as="a" href="#feedback" variant="civic" size="lg" class="min-h-12 shrink-0 px-6">
          <span>Share Your Feedback</span>
          <!-- <ArrowRight aria-hidden="true" /> -->
        </Button>
      </div>
    </section>

    <section id="privacy" class="scroll-mt-24 bg-muted/70">
      <div
        class="mx-auto grid max-w-7xl gap-4 px-5 py-10 sm:px-8 md:grid-cols-[0.3fr_0.7fr] md:gap-12"
      >
        <h2 class="flex items-center gap-2 text-sm font-semibold text-primary">
          <ShieldCheck class="size-4 shrink-0 text-civic-green-deep" aria-hidden="true" />
          <span>Privacy Policy</span>
        </h2>
        <p class="max-w-3xl text-sm leading-6 text-muted-foreground">
          Responses are stored privately for research and are not published publicly. Name and email
          are optional. Please do not include ID numbers, passwords, or sensitive personal details.
        </p>
      </div>
    </section>
  </div>
</template>
