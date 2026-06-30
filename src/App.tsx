import { Route, Routes } from 'react-router-dom'
import { Today } from './screens/Today'
import { ExerciseDetail } from './screens/ExerciseDetail'
import { PostSession } from './screens/PostSession'
import { Progress } from './screens/Progress'
import { Zone2 } from './screens/Zone2'
import { Settings } from './screens/Settings'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Today />} />
      <Route path="/exercise/:id" element={<ExerciseDetail />} />
      <Route path="/log" element={<PostSession />} />
      <Route path="/zone2" element={<Zone2 />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Today />} />
    </Routes>
  )
}
