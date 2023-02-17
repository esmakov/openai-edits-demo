import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../utils/api";
import { useState } from "react";

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>OpenAI Image Edits Demo</title>
        <meta name="description" content="made by Edward Smakov" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {hello.data ? hello.data.greeting : "Loading tRPC query..."}
            </p>
            {/* <AuthShowcase /> */}
            <UploadImage />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;

const UploadImage: React.FC = () => {
  const [image, setImage] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const squareSize = Math.min(img.width, img.height);
            canvas.width = squareSize;
            canvas.height = squareSize;
            const context = canvas.getContext("2d");
            if (context) {
              context.drawImage(
                img,
                (img.width - squareSize) / 2,
                (img.height - squareSize) / 2,
                squareSize,
                squareSize,
                0,
                0,
                squareSize,
                squareSize
              );
              const pngImage = canvas.toDataURL("image/png");
              setImage(pngImage);
            }
          };
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="bg-gray-300">
      <input type="file" onChange={handleImageUpload} />
      {image && <img src={image} alt="uploaded image" className="max-w-xs" />}
    </div>
  );
};

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
