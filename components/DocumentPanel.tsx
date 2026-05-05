"use client";

type Props = {
  document: string;
  setDocument: (val: string) => void;
};

export default function DocumentPanel({ document, setDocument }: Props) {
  return (
    <div className="w-full h-full p-4 border-r">
      <h2 className="font-bold mb-2">Document</h2>

      <textarea
        className="w-full h-full border p-2"
        value={document}
        onChange={(e) => setDocument(e.target.value)}
        placeholder="Paste document..."
      />
    </div>
  );
}