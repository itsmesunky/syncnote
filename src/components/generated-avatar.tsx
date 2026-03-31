import { memo, useMemo } from "react";

import { generateAvatarUri } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import { AvatarBase } from "@/types";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface Props extends AvatarBase {
  className?: string;
}

export const GeneratedAvatar = memo(({ seed, variant, className }: Props) => {
  const avatarUri = useMemo(() => generateAvatarUri({ seed, variant }), [seed, variant]);

  return (
    <Avatar className={cn(className)}>
      <AvatarImage src={avatarUri} alt="avatar" />
      <AvatarFallback>{seed.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
});
