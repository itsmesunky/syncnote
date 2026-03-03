import { botttsNeutral, initials } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

export const generateAvatarUri = ({
  seed,
  variant,
}: {
  seed: string;
  variant: "botttsNeutral" | "initials";
}) => {
  let avatar;

  if (variant === "botttsNeutral") {
    avatar = createAvatar(botttsNeutral, { seed });
  } else {
    avatar = createAvatar(initials, { seed, fontWeight: 500, fontSize: 42 });
  }

  return avatar.toDataUri();
};
