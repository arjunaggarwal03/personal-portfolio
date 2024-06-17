import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        hi, i'm arjun 👨🏽‍💻
      </h1>
      <p className="mb-4">
        {`i'm an honors cs + math major at umd with experience at capital one, bank of america, and currently amazon. 
        outside of work and school, you can find me busy with alpha kappa psi events, watching some a24 movie, or building an obscure spotify playlist.
        also, i've been building plato (check it out) with my friend rohan.`}
      </p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}
