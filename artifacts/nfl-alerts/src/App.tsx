import { useEffect, useRef } from "react";
import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  useClerk,
} from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";

import { queryClient } from "@/lib/queryClient";
import Home from "@/pages/home";
import Teams from "@/pages/teams";
import TeamDetail from "@/pages/team-detail";
import AlertDetail from "@/pages/alert-detail";
import Breaking from "@/pages/breaking";
import Analyst from "@/pages/analyst";
import Preferences from "@/pages/preferences";
import NotFound from "@/pages/not-found";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const BG_CARD = "#141d2b";
const BG_INPUT = "#1c2535";
const BG_FOOTER = "#0f1623";
const FG = "#f4f6fa";
const FG_MUTED = "#8fa3c0";
const PRIMARY = "#22c55e";
const BORDER = "#243040";

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: PRIMARY,
    colorForeground: FG,
    colorMutedForeground: FG_MUTED,
    colorDanger: "#f43f5e",
    colorBackground: BG_CARD,
    colorInput: BG_INPUT,
    colorInputForeground: FG,
    colorNeutral: BORDER,
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    borderRadius: "0.25rem",
  },
  elements: {
    rootBox: { width: "100%", display: "flex", justifyContent: "center" },
    cardBox: {
      width: "440px",
      maxWidth: "100%",
      overflow: "hidden",
      borderRadius: "0.5rem",
      border: `1px solid ${BORDER}`,
    },
    card: {
      boxShadow: "none",
      border: "none",
      backgroundColor: BG_CARD,
      borderRadius: "0",
    },
    footer: {
      boxShadow: "none",
      border: "none",
      backgroundColor: BG_FOOTER,
      borderRadius: "0",
    },
    headerTitle: { color: FG, fontFamily: "monospace", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" },
    headerSubtitle: { color: FG_MUTED },
    socialButtonsBlockButtonText: { color: FG, fontWeight: "500" },
    formFieldLabel: { color: FG_MUTED, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace" },
    footerActionLink: { color: PRIMARY },
    footerActionText: { color: FG_MUTED },
    dividerText: { color: FG_MUTED },
    identityPreviewEditButton: { color: PRIMARY },
    formFieldSuccessText: { color: PRIMARY },
    alertText: { color: FG },
    logoBox: { marginBottom: "0.5rem" },
    logoImage: { height: "2rem", width: "auto" },
    socialButtonsBlockButton: { backgroundColor: BG_INPUT, border: `1px solid ${BORDER}`, color: FG },
    formButtonPrimary: { backgroundColor: PRIMARY, color: "#0d1117", fontFamily: "monospace", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" },
    formFieldInput: { backgroundColor: BG_INPUT, border: `1px solid ${BORDER}`, color: FG },
    footerAction: { backgroundColor: BG_FOOTER },
    dividerLine: { backgroundColor: BORDER },
    alert: { backgroundColor: BG_INPUT, border: `1px solid ${BORDER}` },
    otpCodeFieldInput: { backgroundColor: BG_INPUT, border: `1px solid ${BORDER}`, color: FG },
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Breaking} />
      <Route path="/feed" component={Home} />
      <Route path="/teams" component={Teams} />
      <Route path="/teams/:teamId" component={TeamDetail} />
      <Route path="/alerts/:alertId" component={AlertDetail} />
      <Route path="/analyst" component={Analyst} />
      <Route path="/preferences" component={Preferences} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      signInFallbackRedirectUrl={basePath || "/"}
      signUpFallbackRedirectUrl={basePath || "/"}
      localization={{
        signIn: {
          start: {
            title: "Sign in to Pressbox",
            subtitle: "Track your teams across NFL, MLB & NBA",
          },
        },
        signUp: {
          start: {
            title: "Join Pressbox Wire",
            subtitle: "Free account · NFL · MLB · NBA alerts & AI insights",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
