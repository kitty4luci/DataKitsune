import { ChatScheduleRepository } from "../repositories/chat-schedule.repository";
import { ChatSchedule } from "../entities/chat-schedule.entity";
import { BotStatusService } from "./bot-status-service";
import { TimeParserService } from "./time-parser.service";

export class ScheduleService {
  constructor(
    private readonly scheduleRepository: ChatScheduleRepository,
    private readonly botStatusService: BotStatusService,
    private readonly timeParser: TimeParserService
  ) {}

  async setSchedule(
    messenger: string,
    actorId: string,
    timeStr: string,
    timezoneStr?: string
  ): Promise<ChatSchedule> {
    // Parse the time string (expected format HH:MM)
    const [hour, minute] = this.timeParser.parseTimeString(timeStr);
    if (hour === null || minute === null) {
      throw new Error(
        "Invalid time format. Please use <b>HH:MM</b> format (e.g. 08:30)"
      );
    }

    let timezoneOffset = 0;
    if (timezoneStr) {
      timezoneOffset = this.timeParser.parseTimezoneString(timezoneStr);
    }

    let schedule = await this.scheduleRepository.findByMessengerAndActorId(
      messenger,
      actorId
    );

    if (!schedule) {
      schedule = new ChatSchedule();
      schedule.messenger = messenger;
      schedule.actorId = actorId;
    }

    schedule.hour = hour;
    schedule.minute = minute;
    schedule.timezoneOffset = timezoneOffset;
    schedule.enabled = true;

    return this.scheduleRepository.save(schedule);
  }

  async disableSchedule(messenger: string, actorId: string): Promise<boolean> {
    const schedule = await this.scheduleRepository.findByMessengerAndActorId(
      messenger,
      actorId
    );

    if (!schedule) {
      return false;
    }

    schedule.enabled = false;
    await this.scheduleRepository.save(schedule);
    return true;
  }

  async getSchedule(
    messenger: string,
    actorId: string
  ): Promise<ChatSchedule | null> {
    return this.scheduleRepository.findByMessengerAndActorId(
      messenger,
      actorId
    );
  }

  async findChatsToUpdate(): Promise<string[]> {
    // Get all active chats where bot is an admin
    const activeChats = await this.botStatusService.getActiveChats();
    const enabledSchedules = await this.scheduleRepository.findAllEnabled();

    // Current UTC time
    const now = new Date();
    const currentUTCHour = now.getUTCHours();
    const currentUTCMinute = now.getUTCMinutes();

    // Find schedules that match the current time (within 5 minutes before or after)
    const chatIds: string[] = [];

    for (const schedule of enabledSchedules) {
      // Calculate local time for this schedule based on timezone offset
      const scheduleLocalHour =
        (schedule.hour - schedule.timezoneOffset + 24) % 24;

      // Check if current UTC time matches the schedule's adjusted time
      if (
        this.timeParser.isTimeMatching(
          currentUTCHour,
          currentUTCMinute,
          scheduleLocalHour,
          schedule.minute
        )
      ) {
        chatIds.push(...activeChats);
      }
    }

    return chatIds;
  }
}
