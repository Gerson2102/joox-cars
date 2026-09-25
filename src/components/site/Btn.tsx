import type { ReactNode } from "react";
import { ArrowIcon, ExternalIcon, PhotosIcon, WhatsAppIcon } from "@/components/icons";
import styles from "./buttons.module.css";

type BtnVariant = "yellow" | "ink" | "white" | "ghostLight";
type Icon = "arrow" | "whatsapp" | "photos" | "external";

const ICONS = { arrow: ArrowIcon, whatsapp: WhatsAppIcon, photos: PhotosIcon, external: ExternalIcon };

type Common = {
  children: string;
  variant: BtnVariant;
  icon?: Icon;
  size?: "sm" | "md" | "lg";
  className?: string;
  ariaLabel?: string;
};

type AsLink = Common & { href: string; external?: boolean; type?: never };
type AsButton = Common & { href?: never; external?: never; type: "submit" | "button"; onClick?: () => void; opensDialog?: boolean };

function Inner({ label, icon }: { label: string; icon: Icon }) {
  const Glyph = ICONS[icon];
  return (
    <>
      {/* The label rolls up to a copy of itself on hover. */}
      <span className={styles.label}>
        <span className={styles.roll}>
          <span>{label}</span>
          <span aria-hidden="true">{label}</span>
        </span>
      </span>
      <span className={styles.cap} aria-hidden="true">
        <Glyph className={styles.icon} />
      </span>
    </>
  );
}

/**
 * The site's one button: a pill whose icon capsule floods the whole button on
 * hover (the capsule's colour flows out from the icon) while the label rolls.
 */
export function Btn(props: AsLink | AsButton): ReactNode {
  const { children, variant, icon = "arrow", size = "md", className, ariaLabel } = props;
  const cls = `${styles.btn} ${styles[variant]} ${styles[size]} ${className ?? ""}`;
  if (props.href !== undefined) {
    return (
      <a
        className={cls}
        href={props.href}
        aria-label={ariaLabel}
        {...(props.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        <Inner label={children} icon={icon} />
      </a>
    );
  }
  return (
    <button className={cls} type={props.type} onClick={props.onClick} aria-label={ariaLabel} aria-haspopup={props.opensDialog ? "dialog" : undefined}>
      <Inner label={children} icon={icon} />
    </button>
  );
}
