import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tighter">
        Hi, I'm Arjun 🌆
      </h1>
      <p>
        {`I'm an Honors CS + Math major at the University of Maryland with dev experience at Amazon Web Services, Capital One, and Bank of America. I am currently seeking new grad software developer opportunities. Here's some other stuff I've done:`}
      </p>
      <div>
        <BlogPosts />
      </div>
    </div>
  )
}
