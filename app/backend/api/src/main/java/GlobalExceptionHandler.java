package com.covid19.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDate;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(IllegalArgumentException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, Object> handleBadRequest(IllegalArgumentException ex) {
    return Map.of("error", "Bad Request", "message", ex.getMessage());
  }

  @ExceptionHandler({NoSuchElementException.class})
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public Map<String, Object> handleNotFound(NoSuchElementException ex) {
    return Map.of("error", "Not Found", "message", ex.getMessage());
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, Object> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
    return Map.of("error", "Bad Request", "message", "Invalid parameter value");
  }

  @ExceptionHandler(Exception.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public Map<String, Object> handleGeneric(Exception ex) {
    return Map.of("error", "Internal Server Error", "message", "Unexpected error");
  }
}
