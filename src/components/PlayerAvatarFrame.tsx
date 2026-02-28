interface PlayerAvatarFrameProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  variant?: "red" | "green";
  number?: number;
}

const sizeClasses = {
  sm: "w-10 h-10 text-xs",
  md: "w-14 h-14 text-sm",
  lg: "w-20 h-20 text-lg",
};

const PlayerAvatarFrame = ({ src, name, size = "md", variant = "red", number }: PlayerAvatarFrameProps) => {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="relative inline-flex">
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center font-oswald font-bold ${
          variant === "red" ? "avatar-ring-red" : "avatar-ring-green"
        }`}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center text-foreground">
            {initials}
          </div>
        )}
      </div>
      {number !== undefined && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neon-red flex items-center justify-center">
          <span className="text-[9px] font-oswald font-bold text-foreground">{number}</span>
        </div>
      )}
    </div>
  );
};

export default PlayerAvatarFrame;
