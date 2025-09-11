const errorHandler = (err, req, res, next) => {ä
    console.error(err.stack)
    
    const statusCode = err.status || 500
    res.status(statusCode).json({
        success: false,
        error: {
            message: err.message || 'Internal Server Error',
            status: statusCode
        }
        
  })
}

export default errorHandler