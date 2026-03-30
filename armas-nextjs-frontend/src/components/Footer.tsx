export default function Footer() {
    return (
        <footer style={{
            textAlign: "center",
            padding: "1rem",
            background: "#282c34",
            color: "#ffffff",
            fontSize: "1rem",
            boxShadow: "0 -2px 5px rgba(0, 0, 0, 0.1)",
        }}>
            <p style={{ margin: 0 }}>
                Developed by <a href="https://www.melkatech.com" target="_blank" rel="noopener noreferrer" style={{ color: "#61dafb", textDecoration: "none" }}><strong>MelkaTech</strong></a>
            </p>
        </footer>
    );
}