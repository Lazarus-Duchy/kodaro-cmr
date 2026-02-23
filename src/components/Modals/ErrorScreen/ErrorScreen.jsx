
const ErrorScreen = ( props ) => {
  return (
    <div>
      <h1>{props.errorCode} {props.errorName}</h1>
      <p>{props.errorMessage}</p>
    </div>
  )
}

export default ErrorScreen