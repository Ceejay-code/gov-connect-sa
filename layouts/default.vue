<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ArrowRight, ChevronRight, Menu, X } from "lucide-vue-next";
import civiLinkLogo from "~/assets/images/CiviLinkSA-Logo.png";

const menuOpen = ref<boolean>(false);

const navigation = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Privacy", href: "#privacy" },
];

const currentYear = new Date().getFullYear();

function closeMenu() {
  menuOpen.value = false;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && menuOpen.value) {
    closeMenu();
  }
}

watch(menuOpen, (isOpen: boolean) => {
  if (!import.meta.client) return;
  document.body.style.overflow = isOpen ? "hidden" : "";
});

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (import.meta.client) {
    document.body.style.overflow = "";
  }
});
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- <div class="border-b border-primary/10 bg-primary text-primary-foreground">
      <div
        class="mx-auto flex max-w-7xl items-center justify-center gap-2 px-5 py-2 text-center text-xs leading-5 sm:px-8"
      >
        <Info class="size-3.5 shrink-0 text-civic-gold" aria-hidden="true" />
        <span>
          Concept preview: GovConnect SA is an independent research project, not an official
          government website.
        </span>
      </div>
    </div> -->

    <header class="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <a href="#home" aria-label="GovConnect SA home" @click="closeMenu">
          <img
            :src="civiLinkLogo"
            alt="GovConnect SA"
            width="849"
            height="294"
            decoding="async"
            class="h-14 w-44 object-contain object-left sm:h-16 sm:w-52"
          />
        </a>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="md:hidden"
          :aria-label="menuOpen ? 'Close navigation' : 'Open navigation'"
          :aria-expanded="menuOpen"
          aria-controls="mobile-navigation"
          @click="menuOpen = !menuOpen"
        >
          <X v-if="menuOpen" aria-hidden="true" />
          <Menu v-else aria-hidden="true" />
        </Button>

        <nav aria-label="Main navigation" class="hidden md:flex md:items-center md:gap-6">
          <a
            v-for="item in navigation"
            :key="item.label"
            :href="item.href"
            class="rounded-sm py-1 text-sm font-medium text-foreground transition-colors duration-200 hover:text-civic-green-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {{ item.label }}
          </a>
          <Button as="a" href="#feedback" variant="civic" size="default" class="ml-2">
            <span>Share Your Feedback</span>
            <!-- <ArrowRight aria-hidden="true" /> -->
          </Button>
        </nav>
      </div>
    </header>

    <Teleport to="body">
      <Transition name="backdrop">
        <div
          v-if="menuOpen"
          class="fixed inset-0 z-50 bg-primary/25 backdrop-blur-sm md:hidden"
          aria-hidden="true"
          @click="closeMenu"
        />
      </Transition>

      <Transition name="drawer">
        <aside
          v-if="menuOpen"
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          class="fixed inset-y-0 right-0 z-50 flex w-[min(86vw,21rem)] flex-col border-l border-border bg-background shadow-2xl md:hidden"
        >
          <div class="flex items-center justify-between border-b border-border px-5 py-4">
            <a href="#home" aria-label="GovConnect SA home" @click="closeMenu">
              <img
                :src="civiLinkLogo"
                alt="GovConnect SA"
                width="849"
                height="294"
                class="h-10 w-36 object-contain object-left"
              />
            </a>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close navigation"
              @click="closeMenu"
            >
              <X aria-hidden="true" />
            </Button>
          </div>

          <nav aria-label="Mobile links" class="flex-1 overflow-y-auto px-4 py-5">
            <ul class="space-y-1">
              <li v-for="item in navigation" :key="item.label">
                <a
                  :href="item.href"
                  class="group flex items-center justify-between rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors duration-150 hover:bg-civic-soft hover:text-civic-green-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  @click="closeMenu"
                >
                  <span>{{ item.label }}</span>
                  <ChevronRight
                    class="size-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-civic-green-deep"
                    aria-hidden="true"
                  />
                </a>
              </li>
            </ul>
          </nav>

          <div class="border-t border-border bg-civic-soft/60 p-5">
            <Button
              as="a"
              href="#feedback"
              variant="civic"
              size="lg"
              class="w-full"
              @click="closeMenu"
            >
              <span>Share Your Feedback</span>
              <ArrowRight aria-hidden="true" />
            </Button>
            <p class="mt-3 text-center text-xs text-muted-foreground">
              Independent public-service research
            </p>
          </div>
        </aside>
      </Transition>
    </Teleport>

    <main>
      <slot />
    </main>

    <footer class="bg-background">
      <div class="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div
          class="flex flex-col gap-8 border-b border-border pb-8 md:flex-row md:items-start md:justify-between"
        >
          <div class="max-w-sm">
            <img
              :src="civiLinkLogo"
              alt="GovConnect SA"
              width="849"
              height="294"
              loading="lazy"
              decoding="async"
              class="h-14 w-48 object-contain object-left"
            />
            <p class="mt-3 text-sm leading-6 text-muted-foreground">
              An independent digital initiative exploring how public services could be easier to
              access.
            </p>
          </div>
          <div class="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
            <a class="text-muted-foreground transition-colors hover:text-primary" href="#home">
              Home
            </a>
            <a class="text-muted-foreground transition-colors hover:text-primary" href="#about">
              About
            </a>
            <a
              class="text-muted-foreground transition-colors hover:text-primary"
              href="#how-it-works"
            >
              How It Works
            </a>
            <a class="text-muted-foreground transition-colors hover:text-primary" href="#feedback">
              Share Your Feedback
            </a>
            <a class="text-muted-foreground transition-colors hover:text-primary" href="#privacy">
              Privacy Policy
            </a>
          </div>
        </div>
        <div
          class="flex flex-col gap-3 pt-6 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-start sm:justify-between"
        >
          <p class="max-w-3xl">
            GovConnect SA is an independent concept initiative and is not affiliated with or
            officially endorsed by the South African government.
          </p>
          <p class="shrink-0">© {{ currentYear }} GovConnect SA</p>
        </div>
      </div>
    </footer>
  </div>
</template>
