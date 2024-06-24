import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Hi, I'm Arjun 🌆
      </h1>
      <p className="mb-4">
        {`I'm an Honors CS + Math major at the University of Maryland with dev experience at Capital One, Bank of America, and currently Amazon Web Services.`}
        {` In my free time, I've been building `}
        <a
          href="https://platoportal.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'Poppins, sans-serif',
            color: '#7828FF',
          }}
        >
          <strong className="text-neutral-900 dark:text-neutral-100 tracking-tight hover:text-[#7828FF]">Plato</strong>
        </a>
        {` with my friend Rohan. Here's some other stuff I've done:`}
      </p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}
