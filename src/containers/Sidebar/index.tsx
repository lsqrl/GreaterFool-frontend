import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";

import { CloseButton } from "@/assets/svgs";
import { useColorMode } from "@/hooks/useColorMode";
import {  socialMedia } from "@/utils";

interface Props {
  isSidebarOpen: boolean;
  onSetSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<Props> = ({ isSidebarOpen, onSetSidebarOpen }) => {
  const { mode } = useColorMode();

  const closeSidebar = useCallback(
    () => onSetSidebarOpen(false),
    [onSetSidebarOpen]
  );

  return (
    <Box
      hidden={!isSidebarOpen}
      className={
        " top-0 w-full h-[104vh] bottom-0 right-0 left-0 fixed -translate-y-5  z-[9999999]"
      }
      backgroundColor={mode("#ffffff", "#070b0f")}
    >
      <HStack justifyContent="end" className="p-14">
        <span onClick={closeSidebar}>
          {" "}
          <CloseButton className="w-4 h-4 cursor-pointer" />
        </span>
      </HStack>
      <VStack
        alignItems="start"
        direction="column"
        className="mx-8 my-4"
        spacing={15}
      >
        <Box className="flex flex-col justify-start w-full gap-3">
          {socialMedia.map((item, index) => (
            <Link
              className="flex items-center gap-5"
              key={"item.link + index"}
              href={"item.link"}
              target="_blank"
              onClick={() => closeSidebar()}
            >
              <span style={{ padding: "5px" }}>
                Icon2
              </span>
              <span>{"item.title"}</span>
            </Link>
          ))}
        </Box>
      </VStack>
    </Box>
  );
};

export default Sidebar;
