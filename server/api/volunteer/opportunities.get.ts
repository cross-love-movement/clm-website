import { listOpenProgrammes } from '../../features/volunteers/repository'

/** Public: programmes and roles a visitor can apply for. */
export default defineEventHandler(() => listOpenProgrammes())
