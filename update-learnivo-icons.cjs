const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const requiredFiles = [
  "assets/learnivo-nearby.png",
  "src/components/LearnivoIcon.tsx",
  "src/components/UI.tsx",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing file: ${file}`);
  }
}

const pages = [
  "src/components/UI.tsx",
  "src/screens/shared/NotificationsScreen.web.tsx",
  "src/screens/shared/ProfileScreen.web.tsx",
  "src/screens/student/ActivityScreen.web.tsx",
  "src/screens/student/ClassDetailsScreen.web.tsx",
  "src/screens/student/MatchesScreen.web.tsx",
  "src/screens/student/PreferencesScreen.web.tsx",
  "src/screens/student/TimetableScreen.web.tsx",
  "src/screens/teacher/DashboardScreen.web.tsx",
  "src/screens/teacher/RequestsScreen.web.tsx",
  "src/screens/teacher/StudentsScreen.web.tsx",
];

const logoImage =
  /<Image\b(?=[^<>]*?learnivo-nearby\.png)[^<>]*?\/>/g;

for (const file of pages) {
  const fullPath = path.join(root, file);

  if (!fs.existsSync(fullPath)) {
    console.log(`File missing: ${file}`);
    continue;
  }

  const original = fs.readFileSync(fullPath, "utf8");
  const newline = original.includes("\r\n") ? "\r\n" : "\n";
  let code = original.replace(/\r\n/g, "\n");
  const before = code;

  code = code.replace(logoImage, "<LearnivoIcon />");

  // Remove the old Class details color filter around the new icon.
  code = code.replace(
    /<span className="lcd-brand-icon" aria-hidden="true">\s*(<LearnivoIcon\s*\/>)\s*<\/span>/g,
    "$1",
  );

  if (/\/(Requests|Students)Screen\.web\.tsx$/.test(file)) {
    code = code.replace(
      /<strong>\s*Learnivo\s*<\/strong>/i,
      `<strong style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LearnivoIcon />
          Learnivo
        </strong>`,
    );
  }

  if (!code.includes("<LearnivoIcon")) {
    console.log(`Brand markup needs checking: ${file}`);
    continue;
  }

  if (!/import\s+LearnivoIcon\s+from\s+/.test(code)) {
    const importPath = file.startsWith("src/components/")
      ? "./LearnivoIcon"
      : "../../components/LearnivoIcon";

    code = `import LearnivoIcon from "${importPath}";\n${code}`;
  }

  if (!/<Image\b/.test(code)) {
    code = code
      .replace(/^import \{ Image \} from ["']react-native["'];\n/gm, "")
      .replace(/^\s{2}Image,\n/gm, "");
  }

  if (code === before) {
    console.log(`Already applied: ${file}`);
    continue;
  }

  fs.writeFileSync(fullPath, code.replace(/\n/g, newline), "utf8");
  console.log(`Updated: ${file}`);
}