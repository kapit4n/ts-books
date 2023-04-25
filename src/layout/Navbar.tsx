import "./Navbar.css"

export default function () {
  const pages = [
    {
      name: "Home",
      link: '/home'
    },
    {
      name: "about",
      link: '/about'
    },
  ]
  return (
    <div className="navbar">
      {pages.map(page => <a className="item" href={page.link}>{page.name}</a>)}
    </div>
  )
}
