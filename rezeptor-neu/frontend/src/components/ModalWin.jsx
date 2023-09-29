import ReactPortal from "./ReactPortal.jsx";
import "./ModalWin.css";

function ModalWin({ children }) {

    return (
        <ReactPortal wrapperId="PortalContainer">
            <div className="modal">
                <div className="modal-content">{children}</div>
            </div>
        </ReactPortal>
  );
}
export default ModalWin;

