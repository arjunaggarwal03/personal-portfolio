import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tighter">
        Hi, I'm Arjun 👋🏽
      </h1>
      <p>
        I'm currently an AI product engineer at{' '}
        <a 
          href="https://lightfield.app"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#f78c58] transition-colors duration-200"
        >
          Lightfield
        </a>
        {' '}with previous experience at YouTube (
        <a 
          href="https://www.linkedin.com/posts/arjunaggarwal1_after-a-year-in-stealth-were-excited-to-activity-7394786703821000704-MlfE?utm_source=share&utm_medium=member_desktop&rcm=ACoAACqlRDUBDbuRLD5ncu1mgZInRkfx6-Lm2bU"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#f78c58] transition-colors duration-200"
        >
          it was brief
        </a>
        ), AWS, and Capital One. Here's some stuff I've worked on:
      </p>
      <div>
        <BlogPosts />
      </div>
    </div>
  )
}
