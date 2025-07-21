// src/pages/CppCompiler.tsx

import BasicCompiler from "./CompilerForm";

const backendBaseUrl = import.meta.env.VITE_API_URL;
export default function PythonCompilerPage() {
  return (
    <BasicCompiler defaultLanguage="python" backendBaseUrl={`${backendBaseUrl}/api/compilers`} />
  );
}

