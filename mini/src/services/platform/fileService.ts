export const fileService = {
  async selectEvidence(): Promise<File | null> {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf";
    return new Promise((resolve) => {
      input.onchange = () => resolve(input.files?.[0] ?? null);
      input.click();
    });
  },
};
