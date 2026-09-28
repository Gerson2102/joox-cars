import b from "./bands.module.css";

type Stage = { title: string; steps: { title: string; body: string }[] };

/**
 * The whole import, folded under the journey: its two stages (in the US, in Costa Rica), every step
 * numbered through. A native <details>, so the steps are in the page for search and AI crawlers
 * even while folded, and it opens without script.
 */
export function ImportProcess({ t }: { t: { toggle: string; intro: string; stages: Stage[] } }) {
  return (
    <details className={b.process}>
      <summary className={b.processToggle}>
        {t.toggle}
        <span className={b.foldChevron} aria-hidden="true" />
      </summary>
      <div className={b.processBody}>
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
    </details>
  );
}
