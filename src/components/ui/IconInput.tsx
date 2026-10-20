import { useState } from "react";
import type { InputHTMLAttributes } from "react";

import { Eye, EyeOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  icon: LucideIcon;
};

/**
 * A text input with a leading icon. Password fields also get a
 * show/hide toggle so people can check what they typed.
 */
export default function IconInput({
  icon: Icon,
  type,
  ...rest
}: Props) {
  const [visible, setVisible] = useState(false);

  const isPassword = type === "password";

  return (
    <div
      className={
        isPassword
          ? "input-with-icon has-toggle"
          : "input-with-icon"
      }
    >
      <Icon
        size={18}
        className="input-icon"
        aria-hidden="true"
      />

      <input
        {...rest}
        type={isPassword && visible ? "text" : type}
      />

      {isPassword && (
        <button
          type="button"
          className="input-toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={
            visible ? "Ocultar senha" : "Mostrar senha"
          }
          aria-pressed={visible}
        >
          {visible ? (
            <EyeOff size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}
