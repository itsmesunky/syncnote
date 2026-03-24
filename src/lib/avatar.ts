import { botttsNeutral, initials } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

import { AvatarBase } from "@/types";

export const getAvatarInstance = ({ seed, variant }: AvatarBase) => {
  if (variant === "botttsNeutral") {
    return createAvatar(botttsNeutral, { seed });
  }

  return createAvatar(initials, { seed, fontWeight: 500, fontSize: 42 });
};

export const generateAvatarUri = ({ seed, variant }: AvatarBase) => {
  return getAvatarInstance({ seed, variant }).toDataUri();
};
