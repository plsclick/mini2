import { ArrowRight, Camera, X } from "lucide-react";
import { fileService } from "../../services/platform/fileService";
export function ActionModal({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  const delay = title === "REPORT DELAY";
  return (
    <div className="modal">
      <div className="action-modal">
        <button className="close" onClick={onClose}>
          <X />
        </button>
        <p className="eyebrow">SITE OPERATIONS</p>
        <h2>{title}</h2>
        <label>
          TASK
          <select>
            <option>Structural Steel · Level 04</option>
          </select>
        </label>
        {delay ? (
          <div className="twocol">
            <label>
              DELAY DURATION
              <input placeholder="3 days" />
            </label>
            <label>
              REASON
              <select>
                <option>Material</option>
                <option>Workforce</option>
                <option>Equipment</option>
                <option>Weather</option>
              </select>
            </label>
          </div>
        ) : (
          <label>
            NEW PROGRESS
            <input placeholder="78%" />
          </label>
        )}
        <label>
          {delay ? "DESCRIPTION" : "NOTES"}
          <textarea placeholder="Add context for the project team..." />
        </label>
        <button className="upload" onClick={() => fileService.selectEvidence()}>
          <Camera size={17} />
          Add photo or attachment
        </button>
        <button className="primary" onClick={onClose}>
          {delay ? "SUBMIT DELAY REPORT" : "SUBMIT UPDATE"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
