const globalConfig = {
  workspaces: {
    ".": {
      ignoreBinaries: ["check-outdated"],
      ignoreDependencies: ["wrangler"],
    },
    "packages/*": {
      paths: {
        "$app/*": ["../../node_modules/@sveltejs/kit/src/runtime/app/*"],
      },
      ignoreUnresolved: [
        "\\$dist/.*",
        "\\$lib/paraglide/.*",
        "\\$env/*",
        "\\$types",
      ],
      ignoreDependencies: ["tailwindcss", "flowbite"],
    },
  },
};

export default {
  workspaces: {
    ...globalConfig.workspaces,
    "packages/dropin-service": {
      ...globalConfig.workspaces["packages/*"],
      ignore: [
        "./src/lib-v4/sdk/*",
        "./src/lib/services/*", // Temporary when migrating to v5
      ],
    },
    "packages/dash": {
      ...globalConfig.workspaces["packages/*"],
      paths: {
        ...globalConfig.workspaces["packages/*"].paths,
        "$lib/*": ["./src/lib/*"],
      },
      ignore: [
        "./$types",
        "./src/lib/components/ui/**", // Disable validation for shadcn export way.
        "*.config.js",
      ],
    },
    "packages/eslint-config": {
      // Used as plugin by prettier
      ignoreDependencies: [
        "prettier-plugin-svelte",
        "prettier-plugin-tailwindcss",
      ],
    },
  },
};
