import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="mb-16">
      <ul className="font-sm mt-8 flex flex-col items-center justify-center space-x-0 space-y-2 text-neutral-600 md:flex-row md:space-x-4 md:space-y-0 dark:text-neutral-300">
        <li>
          <a
            className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
            rel="noopener noreferrer"
            target="_blank"
            href="https://www.linkedin.com/in/arjunaggarwal1/"
          >
            <Image
              src="/linkedin.png"
              alt="LinkedIn"
              width={20} // Adjust the width as necessary
              height={20} // Adjust the height as necessary
              className="h-5 w-5"
            />
          </a>
        </li>
        <li>
          <a
            className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
            rel="noopener noreferrer"
            target="_blank"
            href="https://github.com/arjunaggarwal03"
          >
            <Image
              src="/github.png"
              alt="GitHub"
              width={20} // Adjust the width as necessary
              height={20} // Adjust the height as necessary
              className="h-5 w-5"
            />
          </a>
        </li>
        <li>
          <a
            className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
            rel="noopener noreferrer"
            target="_blank"
            href="https://github.com/arjunaggarwal03/personal-portfolio"
          >
            <Image
              src="/source.png"
              alt="Source"
              width={20} // Adjust the width as necessary
              height={20} // Adjust the height as necessary
              className="h-5 w-5"
            />
          </a>
        </li>
      </ul>
    </footer>
  )
}
