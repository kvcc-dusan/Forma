import { Route, Routes } from 'react-router-dom'
import { Home } from './screens/Home'
import { Train } from './screens/Train'
import { Workouts } from './screens/Workouts'
import { WorkoutDetail } from './screens/WorkoutDetail'
import { ExerciseDetail } from './screens/ExerciseDetail'
import { Progress } from './screens/Progress'
import { Settings } from './screens/Settings'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/train" element={<Train />} />
      <Route path="/workouts" element={<Workouts />} />
      <Route path="/workout/:dayId" element={<WorkoutDetail />} />
      <Route path="/exercise/:id" element={<ExerciseDetail />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
