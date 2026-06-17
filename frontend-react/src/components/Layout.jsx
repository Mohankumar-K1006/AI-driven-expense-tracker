import Sidebar from './Sidebar';

export default function Layout({ children }) {
    return (
        <>
            <Sidebar />
            <div className="page-content">
                {children}
            </div>
        </>
    );
}
