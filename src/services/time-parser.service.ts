import * as fs from "fs";
import * as path from "path";
import { Logger } from "./system/logger";

export class TimeParserService {
  private cityTimezones: Record<string, number> = {};
  private readonly logger = new Logger(TimeParserService.name);

  constructor() {
    this.loadTimezones();
  }

  /**
   * Load timezone data from JSON file
   */
  private loadTimezones(): void {
    try {
      // Try to load from the root directory
      const timezonesPath = path.resolve(process.cwd(), "timezones.json");
      const fileContent = fs.readFileSync(timezonesPath, "utf8");
      const timezones = JSON.parse(fileContent);

      this.cityTimezones = timezones;
      this.logger.info("Loaded city timezones", {
        count: Object.keys(this.cityTimezones).length,
        path: timezonesPath,
      });
    } catch (error) {
      this.logger.warn("Failed to load timezones from file", { error });
      this.logger.warn("Using fallback empty timezone map");
      this.cityTimezones = {};
    }
  }

  /**
   * Parse a time string in format HH:MM
   * @param timeStr Time string in format HH:MM
   * @returns [hour, minute] or [null, null] if invalid
   */
  public parseTimeString(timeStr: string): [number | null, number | null] {
    const timeRegex = /^(\d{1,2}):(\d{2})$/;
    const match = timeStr.match(timeRegex);

    if (!match) {
      return [null, null];
    }

    const hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return [null, null];
    }

    return [hour, minute];
  }

  /**
   * Parse a timezone string (+3, -1, Moscow, New York, etc.)
   * @param timezoneStr Timezone string
   * @returns The offset in hours
   */
  public parseTimezoneString(timezoneStr: string): number {
    // Try to parse as a numeric offset (+3, -1, etc.)
    const offsetRegex = /^([+-])(\d{1,2})$/;
    const match = timezoneStr.match(offsetRegex);

    if (match) {
      const sign = match[1] === "+" ? 1 : -1;
      const hours = parseInt(match[2], 10);
      return sign * hours;
    }

    // Try to match a city name
    const cityName = timezoneStr.toLowerCase().trim();
    if (this.cityTimezones[cityName] !== undefined) {
      return this.cityTimezones[cityName];
    }

    // Default to GMT
    return 0;
  }

  /**
   * Check if current time matches the scheduled time (within 5 minutes before or after)
   * @param currentHour Current hour (0-23)
   * @param currentMinute Current minute (0-59)
   * @param scheduleHour Scheduled hour (0-23)
   * @param scheduleMinute Scheduled minute (0-59)
   * @returns true if the times match within the window, false otherwise
   */
  public isTimeMatching(
    currentHour: number,
    currentMinute: number,
    scheduleHour: number,
    scheduleMinute: number,
    windowMinutes = 5
  ): boolean {
    // Convert both times to minutes since midnight
    const currentMinutes = currentHour * 60 + currentMinute;
    const scheduleMinutes = scheduleHour * 60 + scheduleMinute;

    // Calculate the absolute difference in minutes (handling day wraparound)
    const diff = Math.min(
      Math.abs(currentMinutes - scheduleMinutes),
      1440 - Math.abs(currentMinutes - scheduleMinutes)
    );

    // Return true if the difference is less than or equal to the window minutes
    return diff <= windowMinutes;
  }
}
