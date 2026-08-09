import { Link } from 'react-router-dom';
export default function RuntimeError() { return <div className="page error-page"><div className="container error-inner"><span className="error-code">500</span><h1>Something broke.</h1><p>“Even robots crash. The trick is making them restart gracefully.”</p><Link to="/" className="btn btn-primary">← Restart the portfolio</Link></div></div>; }
