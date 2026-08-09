export default function PageSkeleton(){
  return <div className="page page-skeleton" aria-hidden="true"><div className="container skeleton-container">
    <div className="skeleton-line skeleton-eyebrow"/><div className="skeleton-line skeleton-title"/><div className="skeleton-line skeleton-subtitle"/>
    <div className="skeleton-grid">{[1,2,3,4].map(i=><div className="skeleton-card" key={i}><div className="skeleton-block"/><div className="skeleton-line"/><div className="skeleton-line short"/></div>)}</div>
  </div></div>
}
