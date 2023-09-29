/***********************************************************************************************************
 * 
 * ingenious!  see at:
 * 
 * https://stackoverflow.com/questions/46592833/how-to-use-switch-statement-inside-a-react-component#answer-73958890
 * 
*/
export const Switch = ( { val, children } ) => {

    const defaultResult = children.find( (child) => child.props.default ) || null;

    const result = children.find( (child) => child.props.val === val );
  
    return result || defaultResult;
};

export const Case = ({ children }) => children;
