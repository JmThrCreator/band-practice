import type { NextPage } from "next";
import Head from "next/head";
// import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { useState } from "react";
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';

const Home: NextPage = () => {

  const getCode = trpc.code.getCode.useMutation();

  const [buttonClicked, setButtonClicked] = useState(false);
  const [customLink, setCustomLink] = useState("");

  const url = "localhost:3000/page/"

  return (
    <div className="bg-gray-100">
      <Head>
        <title>Band Practice</title>
        <meta name="description" content="Band Practice" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex min-h-screen flex-col md:items-center md:px-40 p-10">

        <div 
          className="absolute pointer-events-none inset-0 "
          style={{backgroundImage:"linear-gradient(rgba(0, 0, 0, .02) .1em, transparent .1em), linear-gradient(90deg, rgba(0, 0, 0, .02) .1em, transparent .1em); background-size: 2em 2em;", maskImage:"radial-gradient(black, transparent);-webkit-mask-image:radial-gradient(black, transparent)"}}
        />

        <h2 className="z-10 text-xl font-extrabold text-gray-400 md:text-2xl font-mono">
          Band Practice
        </h2>

        <h1 className="z-10 text-4xl md:w-[50rem] font-extrabold leading-tight md:leading-tight md:text-center text-gray-700 md:text-5xl my-20">
          A page for <span className="text-blue-400">bands</span> and <span className="text-sky-400">musicians</span> to keep track of <span className="text-teal-400">songs</span>
        </h1>

        <p className="text-gray-400 absolute bottom-7 font-mono">
          By The Committee
        </p>

        <div className="flex md:text-lg sm:text-base gap-5 my-10 font-mono">
          <button 
            className={`text-gray-500 border-gray-300 border z-10 transition-all font-bold flex flex-col justify-center rounded bg-gray-200/40 py-2 px-4 md:py-3 md:px-6 duration-300 ${!buttonClicked ? "hover:bg-gray-200/100 cursor-pointer":"cursor-text select-text"}`}
            onClick={ async () => 
              {
                if (!buttonClicked) {
                  setCustomLink(url + await getCode.mutateAsync());
                  setButtonClicked(true)
                }
              }
            }
          >
            {buttonClicked ?
              <p className="sm:w-64 w-32 md:w-max text-ellipsis truncate">
                {customLink}
              </p>
              :
              <p>
                Generate board link
              </p>
            }
          </button>
          {buttonClicked &&
            <button
              className="text-gray-500 border-gray-300 border z-10 transition-all text-base font-bold flex cursor-pointer flex-col justify-center rounded bg-gray-200/40 py-2 px-2 md:py-3 md:px-4 duration-300 hover:bg-gray-200/100"
              onClick={ async () => 
                {
                  if (buttonClicked) {
                    navigator.clipboard.writeText(customLink)
                  }
                }
              }
            >
              <DocumentDuplicateIcon className="w-7"/>
            </button>
          }
        </div>

      </main>
    </div>
  );
};

export default Home;