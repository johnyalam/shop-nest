function Rating({ value, text, color = '#f8e825' }) {
  const stars = [1, 2, 3, 4, 5].map((n) => {
    if (value >= n) return 'fas fa-star'              // full star
    if (value >= n - 0.5) return 'fas fa-star-half-alt' // half star
    return 'far fa-star'                              // empty star
  })

  return (
    <div className="rating">
      {stars.map((cls, i) => (
        <span key={i}><i style={{ color }} className={cls}></i></span>
      ))}
      {text && <span>{text}</span>}
    </div>
  )
}

export default Rating