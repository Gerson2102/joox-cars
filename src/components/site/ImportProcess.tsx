import type { Dictionary } from "@/app/[lang]/dictionaries";
import b from "./bands.module.css";

/** The whole import, on the import page under the journey: its two stages (in the US, in Costa Rica), every step numbered through. */
export function ImportProcess({ t }: { t: Dictionary["import"]["process"] }) {
  return (
    <div id="process" className={b.processBody}>
      <p className={b.lead}>{t.intro}</p>
      <div className={b.stages}>
        {t.stages.map((stage, i) => {
          const first = t.stages.slice(0, i).reduce((n, s) => n + s.steps.length, 1);
          return (
            <div key={stage.title} className={b.stage}>
              <h3 className={b.stageTitle}>{stage.title}</h3>
              <ol className={b.stageSteps} start={first}>
                {stage.steps.map((step, k) => (
                  <li key={step.title}>
                    <span className={b.stageNum} aria-hidden="true">
                      {String(first + k).padStart(2, "0")}
                    </span>
                    <h4 className={b.stageStepTitle}>{step.title}</h4>
                    <p className={b.stageStepBody}>{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </div>
  );
}
