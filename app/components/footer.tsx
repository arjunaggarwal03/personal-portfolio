import Image from 'next/image';

export default function Footer() {
  return (
    <ul className="flex items-center justify-center space-x-4">
      <li className="flex-shrink-0">
        <a
          className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
          rel="noopener noreferrer"
          target="_blank"
          href="https://www.linkedin.com/in/arjunaggarwal1/"
        >
          <Image
            src="/linkedin.png"
            alt="LinkedIn"
            width={20}
            height={20}
            className="h-5 w-5"
          />
        </a>
      </li>
      <li className="flex-shrink-0">
        <a
          className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
          rel="noopener noreferrer"
          target="_blank"
          href="https://github.com/arjunaggarwal03"
        >
          <Image
            src="/github.png"
            alt="GitHub"
            width={20}
            height={20}
            className="h-5 w-5"
          />
        </a>
      </li>
      <li className="flex-shrink-0">
        <a
          className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
          rel="noopener noreferrer"
          target="_blank"
          href="https://github.com/arjunaggarwal03/personal-portfolio"
        >
          <Image
            src="/source.png"
            alt="Source"
            width={20}
            height={20}
            className="h-5 w-5"
          />
        </a>
      </li>
    </ul>
  )
}
