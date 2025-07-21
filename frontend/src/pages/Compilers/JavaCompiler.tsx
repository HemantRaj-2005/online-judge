// src/pages/CppCompiler.tsx

import BasicCompiler from "./CompilerForm";

const backendBaseUrl = import.meta.env.VITE_API_URL;
export default function JavaCompilerPage() {
  return (
    <BasicCompiler defaultLanguage="java" backendBaseUrl={`${backendBaseUrl}/api/compilers`} />
  );
}

