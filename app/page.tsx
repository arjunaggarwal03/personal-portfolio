import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Hi, I'm Arjun 🌆
      </h1>
      <p className="mb-4">
        {`I'm an Honors CS + Math major at the University of Maryland with dev experience at Amazon Web Services, Capital One, and Bank of America. I am currently seeking new grad software developer opportunities. Here's some other stuff I've done:`}
      </p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}
