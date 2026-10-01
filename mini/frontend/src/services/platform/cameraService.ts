export const cameraService = {
  async captureEvidence(): Promise<File | null> {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    return new Promise((resolve) => {
      input.onchange = () => resolve(input.files?.[0] ?? null);
      input.click();
    });
  },
};
