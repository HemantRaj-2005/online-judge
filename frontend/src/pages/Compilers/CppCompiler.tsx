// src/pages/CppCompiler.tsx

import BasicCompiler from "./CompilerForm";

const backendBaseUrl = import.meta.env.VITE_API_URL;
export default function CppCompilerPage() {
  return (
    <BasicCompiler defaultLanguage="cpp" backendBaseUrl={`${backendBaseUrl}/api/compilers`} />
  );
}
// Likewise for Java/Python, set defaultLanguage and page
