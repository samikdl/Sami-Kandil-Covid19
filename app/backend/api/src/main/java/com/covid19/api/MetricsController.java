package com.covid19.api;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/metrics")
@CrossOrigin
public class MetricsController {
  private final MetricsService service;
  public MetricsController(MetricsService service) { this.service = service; }

  @GetMapping("/global")
  public Map<String, Object> global(@RequestParam(name = "date", required = false) String date) {
    return service.global(date);
  }

  @GetMapping("/country/{name}")
  public Map<String, Object> country(
      @PathVariable(name = "name") String name,
      @RequestParam(name = "start", required = false) String start,
      @RequestParam(name = "end",   required = false) String end) {

    List<Map<String,Object>> series = service.countrySeries(name, start, end);
    Map<String,Object> out = new LinkedHashMap<>();
    out.put("country", name);
    out.put("series", series);
    if (!series.isEmpty()) out.put("latest", series.get(series.size()-1));
    return out;
  }
}
