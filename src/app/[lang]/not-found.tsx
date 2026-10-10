import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap" style={{ textAlign: "center", padding: "10vh 0" }}>
      <h1 className="ptitle">404</h1>
      <p className="psum" style={{ margin: "0 auto" }}>الصفحة غير موجودة · Page not found</p>
      <div className="row" style={{ justifyContent: "center" }}>
        <Link className="btn p" href="/ar">الرئيسية</Link>
        <Link className="btn" href="/en">Home</Link>
      </div>
    </main>
  );
}
