"use client";
import { useEffect, useRef, useState } from "react";
type Question = {
  question: string;
  test_answer: string;
  alts: string[];
};

export default function Home() {
  const [faq, setFaq] = useState<Question[] | null>(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [q, setq] = useState<Question | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const viewRef = useRef<HTMLDivElement>(null);
  const setAllApplicationStateToLocalStorage = (state: Record<any, any>) => {
    for (const key in state) {
      localStorage.setItem(key, JSON.stringify(state[key]));
    }
  };

  const getAppStateFromLocalStorage = () => {
    const state: Record<any, any> = {};
    for (const key in localStorage) {
      state[key] = JSON.parse(localStorage.getItem(key) as string);
    }
    if (state.q) setq(state.q);
    if (state.faq) setFaq(state.faq);
    if (state.step) setStep(state.step);
    if (state.uploadModal) setUploadModal(state.uploadModal);
    if (state.fileName) setFileName(state.fileName);
  };

  useEffect(() => {
    getAppStateFromLocalStorage();
  }, []);
  useEffect(() => {
    setAllApplicationStateToLocalStorage({
      faq,
      step,
      q,
      uploadModal,
      fileName,
    });
  }, [faq, step, q, uploadModal, fileName]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          setFaq(jsonData);
          setq(jsonData[0]);
          setFileName(file.name);
          setStep(1);
          setUploadModal(false);
        } catch (error) {}
      };

      reader.readAsText(file);
    }
  };
  const handleExportFAQ = () => {
    if (faq && fileName) {
      const jsonData = JSON.stringify(faq, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName; // Set the download attribute to the original filename
      link.click();
    }
  };
  useEffect(() => {
    // auto scroll to the bottom of the alternatives
    viewRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [faq]);

  return (
    <main className=" min-h-screen ">
      {uploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <h1 className="text-2xl font-bold">Upload FAQ</h1>
            <div className="flex items-center justify-between">
              <input type="file" onChange={handleFileUpload} />
              <button
                onClick={() => setUploadModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="w-full flex items-center justify-between">
        <button
          onClick={() => setUploadModal(true)}
          className="btn btn-primary"
        >
          Upload FAQ
        </button>
        <div>
          {faq && (
            <span>
              {" "}
              {step} / {faq.length}
            </span>
          )}
        </div>
        <button onClick={handleExportFAQ} className="btn btn-secondary">
          Export FAQ
        </button>
      </div>
      {q && (
        <div className="w-full">
          <div className="card mx-auto p-7">
            <div>Main question</div>
            <div dir="rtl">{q?.question}</div>
            <hr />
            <div>Answer</div>
            <div dir="rtl">{q?.test_answer}</div>
          </div>
          <hr />
          <div className="flex w-full justify-center text-xl font-bold">
            Alternatives
          </div>
          <div>
            <div ref={viewRef} className="max-h-[500px] overflow-y-auto">
              {q?.alts.map((alt, i) => (
                <div key={i} className="card mx-auto p-7">
                  <div dir="rtl">{alt}</div>
                </div>
              ))}
            </div>
            <div dir="rtl" className="w-full px-4">
              <span className="">Add new ALT</span>
              <input
                onKeyDown={(e) => {
                  if (e.key === "Enter" && faq && q) {
                    const newAlts = q.alts;
                    newAlts.push(input);
                    setq({ ...q, alts: newAlts });
                    const newFaqs = faq;
                    newFaqs[step - 1] = q;
                    setFaq(newFaqs);
                    setInput("");
                    viewRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "end",
                    });
                  }
                }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                type="text"
                className="w-full input"
              />
            </div>
            <div className="join grid grid-cols-2 px-6 py-3">
              <button
                onClick={() => {
                  if (faq && step > 1) {
                    setStep(step - 1);
                    setq(faq[step - 2]);
                  }
                }}
                className="join-item btn btn-outline"
              >
                Previous page
              </button>
              <button
                onClick={() => {
                  if (faq && step < faq.length) {
                    setStep(step + 1);
                    setq(faq[step]);
                  }
                }}
                className="join-item btn btn-outline "
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
