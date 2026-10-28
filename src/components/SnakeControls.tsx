import { Eye, EyeSlash, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";

type Props = {
  scares: boolean;
  sound: boolean;
  onToggleScares: () => void;
  onToggleSound: () => void;
};

/* Small, always-visible opt-outs. They sit above the vignette but
   below the nav, and never overlap the primary content. */
export function SnakeControls({ scares, sound, onToggleScares, onToggleSound }: Props) {
  return (
    <div className="serpent-controls" role="group" aria-label="Creature experience settings">
      <button
        type="button"
        className="serpent-control"
        aria-pressed={scares}
        aria-label={scares ? "Disable jump scares" : "Enable jump scares"}
        title={scares ? "Disable jump scares" : "Enable jump scares"}
        onClick={onToggleScares}
      >
        {scares ? <Eye size={14} weight="regular" /> : <EyeSlash size={14} weight="regular" />}
        <span>Scares {scares ? "on" : "off"}</span>
      </button>

      <button
        type="button"
        className="serpent-control"
        aria-pressed={sound}
        aria-label={sound ? "Mute creature sound" : "Enable creature sound"}
        title={sound ? "Mute creature sound" : "Enable creature sound"}
        onClick={onToggleSound}
      >
        {sound ? <SpeakerHigh size={14} weight="regular" /> : <SpeakerSlash size={14} weight="regular" />}
        <span>Sound {sound ? "on" : "off"}</span>
      </button>
    </div>
  );
}
